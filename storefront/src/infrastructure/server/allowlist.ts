// Endpoint backend yang boleh dipanggil browser lewat /api/backend (STOREFRONT_PLAN §3).
// Admin, dev, auth (punya route sendiri), device push, dan webhook Midtrans selalu ditolak.

const PUBLIC_GET = [
  /^v1\/banners$/,
  /^v1\/categories$/,
  /^v1\/products$/,
  /^v1\/products\/[^/]+$/,
  /^v1\/stores$/,
  /^v1\/promotions\/(popup|featured)$/,
  /^v1\/app-config$/,
  /^v1\/help$/,
  /^v1\/legal\/[^/]+$/,
];

const CUSTOMER = [
  /^v1\/me(\/(addresses|payment-methods|favorites|vouchers)(\/[^/]+)?)?$/,
  /^v1\/me\/payment-methods\/default$/,
  /^v1\/orders(\/quote)?$/,
  /^v1\/orders\/[^/]+(\/(cancel|rating))?$/,
  /^v1\/checkout$/,
  /^v1\/payments$/,
  /^v1\/payments\/(?!midtrans)[^/]+(\/cancel)?$/,
];

/** `path` tanpa garis miring awal, mis. `v1/products/P01`. */
export function isAllowed(method: string, path: string): boolean {
  if (path.split("/").some((seg) => seg === ".." || seg === "." || seg === "")) return false;
  if (method === "GET" && PUBLIC_GET.some((re) => re.test(path))) return true;
  return CUSTOMER.some((re) => re.test(path));
}
