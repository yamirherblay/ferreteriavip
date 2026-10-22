export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  currency?: string;
  estado: 'Disponible' | 'Agotado';
  /** Aviso "pocas unidades" (booleano derivado del stock, no expone la cantidad). */
  is_low?: boolean;
  oferta?: boolean;
  descuento: number;
  descripcion?: string;
  new?: boolean;
  negocio_id?: string;
  created_at?: string;
  deleted_at?: string | null;
}

export interface ProductFormData {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  currency: string;
  estado: 'Disponible' | 'Agotado';
  oferta: boolean;
  descuento: number;
  descripcion: string;
  new: boolean;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartDelivery {
  method: 'domicilio' | 'retiro';
  name?: string;
  address?: string;
  refs?: string;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  isAdmin?: boolean;
}

export type OrderStatus = 'Pendiente' | 'Confirmado' | 'Entregado' | 'Cancelado' | 'Rechazado';

export interface Order {
  id: number;
  token: string;
  total_cup: number | null;
  total_usd: number | null;
  type_delivery: 'domicilio' | 'retiro';
  status: OrderStatus;
  client_name?: string | null;
  address_client?: string | null;
  negocio_id: string;
  created_at: string;
}

export interface OrderProductRow {
  id: number;
  id_order: number;
  id_product: string;
  qty: number;
  price_at_order: number | null;
  products?: { name: string; image?: string; currency?: string } | null;
}
