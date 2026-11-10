import { defineStore } from 'pinia';
import { supabase } from 'boot/supabase';

interface AuthState {
  isAuthenticated: boolean;
  negocio_id: string | null;
  user: {
    id: string;
    email: string;
  } | null;
}

const STORAGE_KEY = 'ferreteriavip_auth';

// Evita registrar varias veces la suscripción de auth (navegaciones
// concurrentes al arrancar, HMR, etc.).
let authInitialized = false;
let authUnsubscribe: (() => void) | null = null;

function loadState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthState;
  } catch {
    console.error('Error loading auth state from localStorage.');
  }
  return { isAuthenticated: false, negocio_id: null, user: null };
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => loadState(),
  getters: {
    isAdmin: () => true,
    userEmail: (state) => state.user?.email || null,
  },
  actions: {
    async fetchNegocioId(userId: string) {
      const { data, error } = await supabase
        .from('negocios')
        .select('id')
        .eq('user_uuid', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching negocio:', error.message);
        return;
      }

      this.negocio_id = data?.id || null;
    },

    async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          this.isAuthenticated = true;
          this.user = {
            id: data.user.id,
            email: data.user.email || '',
          };
          await this.fetchNegocioId(data.user.id);
          this.persist();
          return { success: true };
        }

        return { success: false, error: 'Error desconocido' };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error de conexión';
        return { success: false, error: message };
      }
    },

    async logout() {
      await supabase.auth.signOut();
      this.resetAuth();
    },

    resetAuth() {
      this.isAuthenticated = false;
      this.negocio_id = null;
      this.user = null;
      this.persist();
    },

    subscribeToAuthChanges() {
      if (authUnsubscribe) authUnsubscribe();

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          this.resetAuth();
          return;
        }

        // TOKEN_REFRESHED y USER_UPDATED no deben volver a consultar la BD:
        // eso encadenaba getSession() → refresh → evento → otra consulta.
        if (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION') {
          this.isAuthenticated = true;
          this.user = {
            id: session.user.id,
            email: session.user.email || '',
          };
          this.persist();
          return;
        }

        this.isAuthenticated = true;
        this.user = {
          id: session.user.id,
          email: session.user.email || '',
        };

        // Nunca consultar la BD dentro del callback: se difiere para no
        // reentrar en el lock de auth mientras se refresca el token.
        if (!this.negocio_id) {
          const userId = session.user.id;
          queueMicrotask(() => {
            void this.fetchNegocioId(userId).then(() => this.persist());
          });
        } else {
          this.persist();
        }
      });

      authUnsubscribe = data.subscription.unsubscribe;
    },

    async initializeAuth() {
      if (authInitialized) return;
      authInitialized = true;

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          // Solo borramos la sesión si el error es definitivo (token inválido).
          // Si es de red, la conservamos para poder refrescar más adelante.
          const status = error.status ?? 0;
          const isUnrecoverable = status === 400 || status === 401 || status === 403;

          if (isUnrecoverable) {
            console.warn('Sesión inválida. Vuelve a iniciar sesión:', error.message);
            await supabase.auth.signOut({ scope: 'local' });
          } else {
            console.warn('No se pudo refrescar la sesión (posible fallo de red):', error.message);
          }

          this.resetAuth();
        } else if (session?.user) {
          this.isAuthenticated = true;
          this.user = {
            id: session.user.id,
            email: session.user.email || '',
          };
          await this.fetchNegocioId(session.user.id);
          this.persist();
        } else {
          // No hay sesión válida: limpia el estado persistido para no quedarse
          // "autenticado" con un negocio_id viejo y fallar luego en silencio.
          this.resetAuth();
        }

        this.subscribeToAuthChanges();
      } catch (e) {
        // Si algo inesperado falla, permitir reintentar en la próxima navegación.
        authInitialized = false;
        throw e;
      }
    },

    persist() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            isAuthenticated: this.isAuthenticated,
            negocio_id: this.negocio_id,
            user: this.user,
          }),
        );
      } catch {
        console.error('Error saving auth state to localStorage.');
      }
    },
  },
});
