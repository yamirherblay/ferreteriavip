import type { OrderStatus } from 'src/stores/types';

const STATUS_CLASSES: Record<OrderStatus, string> = {
  Pendiente: 'status-pill--pendiente',
  Confirmado: 'status-pill--confirmado',
  Entregado: 'status-pill--entregado',
  Cancelado: 'status-pill--cancelado',
  Rechazado: 'status-pill--rechazado',
};

export function orderStatusClass(status: OrderStatus): string {
  return `status-pill ${STATUS_CLASSES[status] ?? 'status-pill--cancelado'}`;
}
