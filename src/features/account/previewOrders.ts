// Fictional customer-facing examples, deliberately separate from admin orders.
export const previewOrders = [
  { id: "DEMO-103", date: "12 أكتوبر 2026", deliveryDate: "13 أكتوبر · 4–6 مساءً", productId: "marble-cookie-cake", detail: "14 سم · يكفي 5 أشخاص", price: 5000, fee: 1000, area: "غيل باوزير", preparation: 1, delivery: 0, gift: true, writing: "كل عام وأنتِ بخير", note: "يرجى الاتصال قبل الوصول", payment: "حوالة بنكية", paymentStatus: "بانتظار مراجعة السند" },
  { id: "DEMO-102", date: "11 أكتوبر 2026", deliveryDate: "12 أكتوبر · 5–7 مساءً", productId: "cookie-sharing-box", detail: "تشكيلة للمشاركة", price: 6500, fee: 3000, area: "شحير", preparation: 2, delivery: 1, gift: false, writing: "", note: "", payment: "الدفع عند الاستلام", paymentStatus: "المبلغ مستحق عند الاستلام" },
  { id: "DEMO-101", date: "5 أكتوبر 2026", deliveryDate: "6 أكتوبر · 4–6 مساءً", productId: "chocolate-cupcake", detail: "علبة كب كيك", price: 2500, fee: 1800, area: "القارة", preparation: 2, delivery: 2, gift: false, writing: "", note: "", payment: "حوالة بنكية", paymentStatus: "مدفوع — مثال تجريبي" },
] as const;
export const preparationLabels = ["قيد المراجعة", "قيد التنفيذ", "جاهز"];
export const deliveryLabels = ["بانتظار التوصيل", "خرج للتوصيل", "تم التوصيل"];
