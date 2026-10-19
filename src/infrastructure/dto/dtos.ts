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
  store_id: string;
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
    bundle_items?: { product_name: string; option_name: string | null; quantity: number }[];
  }[];
  status_history: { status: string; at: string; note: string | null; changed_by: string | null }[];
  rating: { rating: number; comment: string | null } | null;
  customer: CustomerDTO;
  next_statuses: string[];
  free_delivery_coupon?: boolean;
  delivery_fee_waived?: number;
  distance_km?: number | null;
  eta_min_minutes?: number | null;
  eta_max_minutes?: number | null;
  /** null untuk COD. */
  payment?: {
    id: string;
    provider_order_id: string;
    status: string;
    payment_type: string | null;
    refund_status: string | null;
    paid_at: string | null;
  } | null;
}

export interface PaymentOrderRefDTO {
  id: string;
  order_number: string;
  status: string;
}

export interface AdminPaymentSummaryDTO {
  id: string;
  provider_order_id: string;
  status: string;
  amount: number;
  refunded_amount: number;
  refund_status: string | null;
  payment_type: string | null;
  store_id: string;
  store_name: string;
  customer: CustomerDTO;
  order: PaymentOrderRefDTO | null;
  created_at: string;
  paid_at: string | null;
  expires_at: string;
}

export interface AdminPaymentDTO {
  id: string;
  provider_order_id: string;
  provider_txn_id: string | null;
  status: string;
  amount: number;
  expires_at: string;
  payment_type: string | null;
  paid_at: string | null;
  status_message: string | null;
  refund_status: string | null;
  store: { id: string; name: string };
  quote: {
    subtotal: number;
    delivery_fee: number;
    discount: number;
    total: number;
    items: { product_name: string; option_name: string | null; quantity: number; subtotal: number }[];
  };
  order: PaymentOrderRefDTO | null;
  created_at: string;
  customer: CustomerDTO;
  refunded_amount: number;
  refundable_amount: number;
  can_refund_online: boolean;
  refunds: {
    id: string;
    amount: number;
    reason: string;
    method: string;
    status: string;
    message: string | null;
    admin_name: string | null;
    created_at: string;
  }[];
  events: { source: string; provider_status: string | null; signature_ok: boolean | null; payload: unknown; created_at: string }[];
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
  bundle_items?: {
    product_id: string;
    product_name: string;
    option_id: string | null;
    option_name: string | null;
    quantity: number;
    unit_price: number;
  }[];
  separate_price?: number;
  updated_at: string;
  store?: {
    store_id: string;
    is_listed: boolean;
    is_sold_out: boolean;
    stock: number | null;
    price: number | null;
    deal_price: number | null;
    effective_price: number;
    is_available: boolean;
  };
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
  store_id: string | null;
  store_name: string | null;
  can_edit: boolean;
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
  store_id: string | null;
  by_store: { store_id: string; store_name: string; orders: number; orders_completed: number; revenue: number; success_rate_pct: number }[];
}

export interface AdminStoreDTO {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  opens_at: string;
  closes_at: string;
  hours_label: string;
  delivery_radius_km: number;
  is_active: boolean;
  is_temporarily_closed: boolean;
  is_open_now: boolean;
  sort_order: number;
  unavailable_products: number;
  listed_products: number;
  today: { orders: number; revenue: number; active: number };
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
  store_id: string | null;
  store_name: string | null;
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

export interface DeliverySettingsDTO {
  delivery_fee: number;
  delivery_base_km: number;
  delivery_fee_per_km: number;
  delivery_fee_max: number;
  free_delivery_min_subtotal: number;
  prep_minutes: number;
  courier_speed_kmh: number;
  free_delivery_coupon_enabled: boolean;
  free_delivery_coupon_weekly: number;
}

export interface DeliverySettingsResponseDTO {
  settings: DeliverySettingsDTO;
  examples: { distance_km: number; delivery_fee: number; eta_min_minutes: number; eta_max_minutes: number }[];
  updated_at?: string | null;
}

export interface AdminBannerDTO {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  action_type: string;
  action_value: string | null;
  action_label: string | null;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  is_active: boolean;
  status: string;
  updated_at: string;
}
