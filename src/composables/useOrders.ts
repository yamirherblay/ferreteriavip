import { supabase } from 'boot/supabase';
import { getBusinessId } from 'src/config/business';
import type { CartDelivery, CartItem } from 'src/stores/types';

const PENDING_KEY = 'ferreteriavip_pending_order';

function itemsHash(items: CartItem[]): string {
  return items
    .slice()
    .sort((a, b) => a.product.id.localeCompare(b.product.id))
    .map((i) => `${i.product.id}|${i.quantity}`)
    .join(';');
}

function getOrCreateToken(items: CartItem[]): string {
  const hash = itemsHash(items);
  try {
    const stored = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
    if (stored && stored.hash === hash && typeof stored.token === 'string') {
      return stored.token;
    }
  } catch {
    /* ignore */
  }
  const token = crypto.randomUUID();
  localStorage.setItem(PENDING_KEY, JSON.stringify({ hash, token }));
  return token;
}

export function clearPendingOrder() {
  localStorage.removeItem(PENDING_KEY);
}

export type CreateOrderResult =
  | { ok: true; id: number; token: string }
  | { ok: false; error: string };

const GENERIC_ORDER_ERROR =
  'No se pudo registrar el pedido. Revisa tu conexión e inténtalo de nuevo.';

/** Error de negocio devuelto por la RPC ({ok:false, error}): se muestra el
 *  detalle real (acotado) en vez del genérico de conexión. */
function businessError(detail: string | undefined): string {
  const text = (detail ?? '').trim();
  if (!text) return GENERIC_ORDER_ERROR;
  if (/stock/i.test(text)) {
    return 'Producto sin stock disponible. Actualiza el catálogo e inténtalo de nuevo.';
  }
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

export function useOrders() {
  function effectivePrice(item: CartItem): number {
    const p = item.product;
    return p.oferta && p.descuento ? p.descuento : p.price;
  }

  async function createOrder(
    items: CartItem[],
    totals: Record<string, number>,
    delivery?: CartDelivery,
  ): Promise<CreateOrderResult> {
    const negocio_id = getBusinessId();
    if (!items.length) return { ok: false, error: 'El carrito está vacío.' };
    if (!negocio_id) {
      console.error('createOrder: VITE_NEGOCIO_ID no configurado');
      return { ok: false, error: GENERIC_ORDER_ERROR };
    }

    const token = getOrCreateToken(items);
    const payload = {
      p_negocio_id: negocio_id,
      p_token: token,
      p_total_cup: totals.CUP ?? null,
      p_total_usd: totals.USD ?? null,
      p_type_delivery: delivery?.method ?? 'retiro',
      p_client_name:
        delivery?.method === 'domicilio' ? delivery.name?.trim() || null : null,
      p_address_client:
        delivery?.method === 'domicilio' ? delivery.address?.trim() || null : null,
      p_items: items.map((it) => ({
        id_product: it.product.id,
        qty: it.quantity,
        price_at_order: effectivePrice(it),
      })),
    };

    const { data, error } = await supabase.rpc('create_order', payload);
    // La RPC devuelve fallos internos como {ok:false, error} con HTTP 200,
    // por eso además del error de PostgREST hay que revisar data.ok.
    if (error) {
      console.error('Error createOrder (rpc):', error.message ?? error);
      return { ok: false, error: GENERIC_ORDER_ERROR };
    }
    if (!data || typeof data !== 'object') {
      console.error('Error createOrder: respuesta vacía de la RPC');
      return { ok: false, error: GENERIC_ORDER_ERROR };
    }
    const res = data as { ok?: boolean; id?: number; token?: string; error?: string };
    if (res.ok === false || res.id == null || typeof res.token !== 'string') {
      console.error('Error createOrder (ok:false):', res.error ?? res);
      return { ok: false, error: businessError(res.error) };
    }
    return { ok: true, id: res.id, token: res.token };
  }

  return { createOrder, clearPendingOrder };
}
