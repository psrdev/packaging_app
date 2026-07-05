export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'packer';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  sku: string | null;
  name: string;
  platform_product_id: string | null;
  image: string | null;
  packing_notes: string | null;
  is_fragile: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  sku: string | null;
  quantity_required: number;
  quantity_confirmed: number;
  is_confirmed: boolean;
  packer_note: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface PackingPhoto {
  id: number;
  order_id: number;
  uploaded_by: number | null;
  photo_path: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusLog {
  id: number;
  order_id: number;
  from_status: string | null;
  to_status: string;
  changed_by: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  platform: 'amazon' | 'meesho' | 'flipkart' | 'woocommerce' | 'whatsapp' | 'manual' | null;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  pickup_deadline: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'packing' | 'packed' | 'ready_to_ship' | 'shipped' | 'issue' | 'cancelled';
  shipping_label: string | null;
  created_by: number | null;
  packer_id: number | null;
  packing_started_at: string | null;
  packed_at: string | null;
  ready_to_ship_at: string | null;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  photos?: PackingPhoto[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}
