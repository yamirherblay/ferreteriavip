import { ref } from 'vue';
import { supabase } from 'boot/supabase';
import { getBusinessId, getAdminBusinessId } from 'src/config/business'
import type { Product } from 'src/stores/types';

export function useProducts() {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const negocio_id = getBusinessId();

  async function fetchProducts(category?: string, excludeAgotado = true) {
    loading.value = true;
    error.value = null;
    try {
      let query = supabase.from('products').select('*').eq('negocio_id', negocio_id).is('deleted_at', null);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (excludeAgotado) {
        query = query.neq('estado', 'Agotado');
      }

      query = query.order('new', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      products.value = data || [];
      return products.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error cargando productos';
      console.error('Error fetchProducts:', e);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(productData: Partial<Product>): Promise<Product | null> {
    const adminNegocioId = getAdminBusinessId();
    if (!adminNegocioId) {
      error.value = 'No autorizado: inicia sesión para crear productos';
      return null;
    }

    loading.value = true;
    error.value = null;
    try {
      const dataToInsert = {
        ...productData,
        negocio_id: adminNegocioId,
        currency: 'CUP',
        estado: productData.estado || 'Disponible',
        oferta: productData.oferta || false,
        new: productData.new || false,
        descuento: productData.descuento || 0,
      };

      const { data, error: insertError } = await supabase
        .from('products')
        .insert(dataToInsert)
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error creando producto';
      console.error('Error createProduct:', e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateProduct(id: string, productData: Partial<Product>): Promise<boolean> {
    const adminNegocioId = getAdminBusinessId();
    if (!adminNegocioId) {
      error.value = 'No autorizado: inicia sesión para actualizar productos';
      return false;
    }

    loading.value = true;
    error.value = null;
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .eq('negocio_id', adminNegocioId);

      if (updateError) throw updateError;
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error actualizando producto';
      console.error('Error updateProduct:', e);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id: string): Promise<boolean> {
    const adminNegocioId = getAdminBusinessId();
    if (!adminNegocioId) {
      error.value = 'No autorizado: inicia sesión para eliminar productos';
      return false;
    }

    loading.value = true;
    error.value = null;
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('negocio_id', adminNegocioId)
        .is('deleted_at', null);

      if (deleteError) throw deleteError;
      products.value = products.value.filter((p) => p.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error eliminando producto';
      console.error('Error deleteProduct:', e);
      return false;
    } finally {
      loading.value = false;
    }
  }

  function getCategories(): string[] {
    const categories = new Set<string>();
    products.value.forEach((p) => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories).sort();
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
  };
}
