import { initialDeliveryAreas } from "@/features/delivery/data";
import { seedProducts } from "../catalogStore";
import { previewDate, previewOrders } from "../dashboardPreviewData";
import type { AdminOrder, DeliveryStatus, OrderStatus } from "./types";

export const orderStatusOptions: Record<OrderStatus, { label: string; tone: string }> = {
  review: { label: "قيد المراجعة", tone: "pending" },
  processing: { label: "قيد التنفيذ", tone: "preparing" },
  ready: { label: "جاهز", tone: "ready" },
};
export const deliveryStatusOptions: Record<DeliveryStatus, { label: string; tone: string }> = {
  waiting: { label: "بانتظار التوصيل", tone: "neutral" },
  out: { label: "خرج للتوصيل", tone: "preparing" },
  delivered: { label: "تم التوصيل", tone: "delivered" },
};

// Fictional order snapshots; item prices are preview values, independent of catalog edits.
export const seedOrders: AdminOrder[] = previewOrders.map((order, index) => {
  const product = seedProducts[index % seedProducts.length];
  const area = initialDeliveryAreas[index % initialDeliveryAreas.length];
  const quantity = index % 3 === 0 ? 2 : 1;
  return {
    ...order,
    phone: "",
    deliveryAreaId: area.id,
    deliveryAreaName: area.name,
    total: order.total - 500 + area.fee,
    status: order.status === "new" ? "review" : order.status === "preparing" ? "processing" : "ready",
    deliveryStatus: order.status === "delivered" ? "delivered" : order.status === "ready" ? "out" : "waiting",
    date: previewDate,
    deliveryDate: "2026-10-11",
    deliveryWindow: index % 2 ? "المساء · ٦–٩ مساءً" : "بعد الظهر · ٢–٥ مساءً",
    deliveryFee: area.fee,
    address: "عنوان تجريبي — الشارع الرئيسي، بجانب السوق",
    paymentMethod: index % 2 ? "حوالة بنكية" : "الدفع عند الاستلام",
    gift: index % 4 === 0,
    note: index % 4 === 0 ? "الطلب هدية، يرجى عدم إرفاق السعر." : index % 3 === 0 ? "يرجى التواصل قبل التوصيل." : "",
    items: [{ name: product.name, image: product.photos[0]?.src ?? "", quantity,
      unitPrice: (order.total - 500) / quantity, detail: product.sizes[0]?.label ?? "الحجم المعتاد",
      writing: product.writing.enabled && index % 4 === 0 ? "كل عام وأنتِ بخير" : "" }],
  };
});

export function orderDateLabel(date: string) {
  return new Intl.DateTimeFormat("ar-YE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}
