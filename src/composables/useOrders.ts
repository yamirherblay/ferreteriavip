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

export function useOrders() {
  function effectivePrice(item: CartItem): number {
    const p = item.product;
    return p.oferta && p.descuento ? p.descuento : p.price;
  }

  async function createOrder(
    items: CartItem[],
    totals: Record<string, number>,
    delivery?: CartDelivery,
  ): Promise<{ id: number; token: string } | null> {
    const negocio_id = getBusinessId();
    if (!negocio_id || !items.length) return null;

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
    if (error) {
      console.error('Error createOrder:', error);
      return null;
    }
    return data as { id: number; token: string };
  }

  return { createOrder, clearPendingOrder };
}
