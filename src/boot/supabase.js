import { boot } from 'quasar/wrappers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// En desarrollo Vite puede reevaluar este módulo (HMR). Reutilizamos el mismo
// cliente para no acumular instancias, cada una con su propio auto-refresh.
const GLOBAL_KEY = '__ferreteriavip_supabase__';

/**
 * @type {import('@supabase/supabase-js').SupabaseClient<any, 'public', any>}
 */
let supabase = globalThis[GLOBAL_KEY];

if (!supabase) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Usamos login por email/password: no necesitamos procesar tokens en la URL.
      detectSessionInUrl: false,
    },
  });
  globalThis[GLOBAL_KEY] = supabase;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Evita que quede un ticker de auto-refresh vivo tras un HMR.
    void supabase.auth.stopAutoRefresh();
    delete globalThis[GLOBAL_KEY];
  });
}

/**
 * Si la sesión guardada ya no se puede refrescar (token inválido, proyecto
 * rotado, etc.), la borra del almacenamiento. Sin esto, cada petición de datos
 * volvía a intentar el refresh y generaba decenas de peticiones a
 * /auth/v1/token?grant_type=refresh_token.
 */
async function recoverSession() {
  const { error } = await supabase.auth.getSession();
  if (!error) return;

  const status = error.status ?? 0;
  const isUnrecoverable = status === 400 || status === 401 || status === 403;

  if (isUnrecoverable) {
    console.warn('Sesión inválida, cerrando sesión local:', error.message);
    await supabase.auth.signOut({ scope: 'local' });
  }
}

export default boot(async ({ app }) => {
  await recoverSession();
  app.config.globalProperties.$supabase = supabase;
});

export { supabase };
