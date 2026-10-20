import { defineStore } from 'pinia';
import { supabase } from 'boot/supabase';
import { getAdminBusinessId } from 'src/config/business';
import type { Order, OrderProductRow, OrderStatus } from './types';

export interface OrderStats {
  total: number;
  pendientes: number;
  confirmados: number;
  entregados: number;
  cancelados: number;
}

interface OrdersState {
  stats: OrderStats;
  orders: Order[];
  orderProducts: OrderProductRow[];
  loading: boolean;
  loadedAt: number | null;
}

const emptyStats = (): OrderStats => ({
  total: 0,
  pendientes: 0,
  confirmados: 0,
  entregados: 0,
  cancelados: 0,
});

export const useOrdersStore = defineStore('orders', {
  state: (): OrdersState => ({
    stats: emptyStats(),
    orders: [],
    orderProducts: [],
    loading: false,
    loadedAt: null,
  }),
  getters: {
    pendingCount: (state): number => state.stats.pendientes,
    productsByOrder:
      (state) =>
      (orderId: number): OrderProductRow[] =>
        state.orderProducts.filter((op) => op.id_order === orderId),
  },
  actions: {
    async refreshStats() {
      const negocioId = getAdminBusinessId();
      if (!negocioId) return;
      try {
        const { data } = await supabase.from('order').select('status').eq('negocio_id', negocioId);
        const rows = (data || []) as { status: string }[];
        const stats = emptyStats();
        stats.total = rows.length;
        rows.forEach((r) => {
          if (r.status === 'Pendiente') stats.pendientes += 1;
          else if (r.status === 'Confirmado') stats.confirmados += 1;
          else if (r.status === 'Entregado') stats.entregados += 1;
          else if (r.status === 'Cancelado') stats.cancelados += 1;
        });
        this.stats = stats;
      } catch (e) {
        console.error('Error refreshStats:', e);
      }
    },

    async fetchOrders() {
      const negocioId = getAdminBusinessId();
      if (!negocioId) return;
      this.loading = true;
      try {
        const { data } = await supabase
          .from('order')
          .select('*')
          .eq('negocio_id', negocioId)
          .order('created_at', { ascending: false });
        this.orders = (data || []) as Order[];
        const ids = this.orders.map((o) => o.id);
        if (ids.length) {
          await this.fetchOrderProducts(ids);
        } else {
          this.orderProducts = [];
        }
        this.loadedAt = Date.now();
      } catch (e) {
        console.error('Error fetchOrders:', e);
      } finally {
        this.loading = false;
      }
    },

    async countNewOrders(): Promise<number> {
      if (!this.loadedAt) return 0;
      const negocioId = getAdminBusinessId();
      if (!negocioId) return 0;
      try {
        const { data } = await supabase
          .from('order')
          .select('id')
          .eq('negocio_id', negocioId)
          .order('id', { ascending: false })
          .limit(100);
        const known = new Set(this.orders.map((o) => o.id));
        return (data || []).filter((row) => !known.has(row.id as number)).length;
      } catch (e) {
        console.error('Error countNewOrders:', e);
        return 0;
      }
    },

    async fetchOrderProducts(orderIds: number[]) {
      if (!orderIds.length) {
        this.orderProducts = [];
        return;
      }
      try {
        const { data } = await supabase
          .from('order_products')
          .select('*, products(name, image, currency)')
          .in('id_order', orderIds);
        this.orderProducts = (data || []) as OrderProductRow[];
      } catch (e) {
        console.error('Error fetchOrderProducts:', e);
      }
    },

    async updateOrderStatus(id: number, status: OrderStatus): Promise<boolean> {
      const negocioId = getAdminBusinessId();
      if (!negocioId) return false;
      try {
        const { error } = await supabase
          .from('order')
          .update({ status })
          .eq('id', id)
          .eq('negocio_id', negocioId);
        if (error) throw error;
        const order = this.orders.find((o) => o.id === id);
        if (order) order.status = status;
        await this.refreshStats();
        return true;
      } catch (e) {
        console.error('Error updateOrderStatus:', e);
        return false;
      }
    },

    reset() {
      this.stats = emptyStats();
      this.orders = [];
      this.orderProducts = [];
      this.loading = false;
      this.loadedAt = null;
    },
  },
});
