// DTO = cermin JSON backend (snake_case). Lihat trytuist-api/API_PLAN.md §5.25.

export interface CustomerDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface AdminOrderSummaryDTO {
  order_id: string;
  order_number: string;
  status: string;
  total: number;
  payment_method: string;
  item_summary: string;
  qty: number;
  store_name: string;
  customer: CustomerDTO;
  created_at: string;
  updated_at: string;
}

export interface AdminOrderDTO {
  order_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_provider: string | null;
  payment_account_masked: string | null;
  voucher_code: string | null;
  note: string | null;
  created_at: string;
  store: { id: string; name: string; address: string };
  address: { label: string; recipient: string; phone: string; address: string; notes: string | null } | null;
  items: {
    product_id: string;
    product_name: string;
    option_name: string | null;
    unit_price: number;
    quantity: number;
    note: string;
    subtotal: number;
  }[];
  status_history: { status: string; at: string; note: string | null; changed_by: string | null }[];
  rating: { rating: number; comment: string | null } | null;
  customer: CustomerDTO;
  next_statuses: string[];
}

export interface AdminProductDTO {
  product_id: string;
  product_name: string;
  description: string;
  category_id: string;
  category_name: string;
  price: number;
  deal_price: number | null;
  effective_price: number;
  image_url: string;
  rating: number;
  sold_count: number;
  is_available: boolean;
  is_best_seller: boolean;
  options: { id: string; name: string; extra_price: number }[];
  updated_at: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  icon: string;
}

export interface DealDTO {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  title: string;
  subtitle: string;
  badge: string;
  image_url: string | null;
  deal_price: number;
  discount_percent: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  show_as_popup: boolean;
  sort_order: number;
  status: string;
}

export interface DashboardDTO {
  range: { from: string; to: string };
  sales: {
    revenue: number;
    orders_completed: number;
    average_order_value: number;
    items_sold: number;
    discount_total: number;
    delivery_fee_total: number;
    revenue_change_pct: number | null;
  };
  purchases: {
    orders: number;
    buyers: number;
    new_buyers: number;
    repeat_buyers: number;
    in_progress: number;
    failed: number;
    cancelled: number;
    success_rate_pct: number;
    gross_value: number;
    orders_change_pct: number | null;
  };
  daily: { date: string; revenue: number; orders: number; orders_completed: number }[];
  by_status: { status: string; count: number; total: number }[];
  top_products: { product_id: string; product_name: string; quantity: number; revenue: number }[];
  payment_methods: { method: string; count: number; total: number }[];
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  member_tier: string;
  orders_count: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
}

export interface AdminMeDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuditLogDTO {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  summary: string;
  admin_name: string | null;
  created_at: string;
}
