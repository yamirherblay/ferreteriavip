export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  estado: 'Disponible' | 'Agotado';
  oferta?: boolean;
  descuento: number;
  descripcion?: string;
  new?: boolean;
  negocio_id?: string;
  created_at?: string;
}

export interface ProductFormData {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
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

export interface OrderContact {
  fullName: string;
  phone: string;
  address: string;
  refs?: string;
}

export interface OrderRecord {
  id: string;
  items: CartItem[];
  total: number;
  contact: OrderContact;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  isAdmin?: boolean;
}
