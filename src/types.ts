export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  product_count?: number;
  created_at?: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  is_promo: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  stock: number;
  unit_info: string;
  variant: string;
  serving_suggestion: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  unitInfo?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus =
  | 'Menunggu Konfirmasi'
  | 'Diproses'
  | 'Siap Diambil'
  | 'Dalam Pengiriman'
  | 'Selesai'
  | 'Dibatalkan';

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_method: 'Pengiriman' | 'Ambil Sendiri';
  notes: string;
  items_json: OrderItem[];
  subtotal_amount?: number;
  shipping_fee?: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_url: string;
  status: 'published' | 'draft';
  published_at: string;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  role: string;
  rating: number;
  content: string;
  is_visible: boolean;
  is_demo: boolean;
}

export interface StoreSettings {
  id: number;
  brand_name: string;
  description: string;
  whatsapp_number: string;
  address: string;
  operational_hours: string;
  instagram: string;
  tiktok: string;
  shipping_info: string;
  shipping_fee: number;
}

export interface LocalCartItem {
  productId: number;
  quantity: number;
  clientPrice?: number;
}

export interface ValidatedCartItem {
  productId: number;
  slug: string;
  name: string;
  unitInfo: string;
  imageUrl: string;
  originalPrice: number;
  unitPrice: number;
  isPromo: boolean;
  stock: number;
  quantity: number;
  subtotal: number;
}

export interface ValidatedCartResponse {
  items: ValidatedCartItem[];
  subtotal: number;
  shippingFee: number;
  whatsappNumber: string;
  brandName: string;
  hasChanges: boolean;
  warnings: string[];
}

export interface AdminOverview {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  availableProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
}
