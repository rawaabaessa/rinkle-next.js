// Fixed, deterministic preview data. These are not live analytics or customer records.
export const previewDate = "2026-10-10";
export const previewDateLabel = "10 أكتوبر 2026";
export const numberLabel = (value: number) => value.toLocaleString("ar-YE");

export type PreviewOrder = {
  id: string;
  customer: string;
  total: number;
  status: "new" | "preparing" | "ready" | "delivered";
  time: string;
};

export const orderStatuses = {
  new: { label: "بانتظار التأكيد", tone: "pending" },
  preparing: { label: "قيد التجهيز", tone: "preparing" },
  ready: { label: "جاهز للتسليم", tone: "ready" },
  delivered: { label: "تم التسليم", tone: "delivered" },
};

export const previewOrders: PreviewOrder[] = [
  { id: "RN-1048", customer: "سارة أحمد", total: 8000, status: "new", time: "14:35" },
  { id: "RN-1047", customer: "نورة محمد", total: 5000, status: "preparing", time: "14:12" },
  { id: "RN-1046", customer: "ريم علي", total: 9000, status: "ready", time: "13:50" },
  { id: "RN-1045", customer: "هدى عمر", total: 3500, status: "delivered", time: "13:20" },
  { id: "RN-1044", customer: "ليان خالد", total: 11000, status: "new", time: "12:45" },
  { id: "RN-1043", customer: "مريم حسن", total: 6500, status: "preparing", time: "12:10" },
  { id: "RN-1042", customer: "أمل عبدالله", total: 15000, status: "new", time: "11:40" },
  { id: "RN-1041", customer: "حنين سعيد", total: 4500, status: "delivered", time: "11:15" },
  { id: "RN-1040", customer: "ندى سالم", total: 6000, status: "delivered", time: "10:50" },
  { id: "RN-1039", customer: "دانا أحمد", total: 5000, status: "delivered", time: "10:20" },
  { id: "RN-1038", customer: "رنا علي", total: 8500, status: "delivered", time: "09:45" },
  { id: "RN-1037", customer: "لمى محمد", total: 3000, status: "delivered", time: "09:10" },
];

export const visitorHistory = Array.from({ length: 90 }, (_, index) => {
  const date = new Date(`${previewDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (89 - index));
  return {
    date: date.toISOString().slice(0, 10),
    visitors: index === 89 ? 128 : Math.round(62 + index * 0.65 + Math.sin(index * 0.65) * 24 + (index % 7 === 5 ? 20 : 0)),
  };
});

export const previewSummary = {
  visitors: visitorHistory.at(-1)!.visitors,
  orders: previewOrders.length,
  orderValue: previewOrders.reduce((total, order) => total + order.total, 0),
  pending: previewOrders.filter((order) => order.status === "new").length,
  deliveryIssues: 1,
};

export const tomorrowPreview = {
  afternoon: 5,
  evening: 3,
  mostRequested: "كيك كوكيز الماربل",
  mostRequestedCount: 5,
};

export const topProductPreview = [
  { id: "marble-cookie-cake", quantity: 24 },
  { id: "cookie-bites", quantity: 18 },
  { id: "chocolate-cupcake", quantity: 15 },
  { id: "caramel-cookie-cake", quantity: 11 },
];
