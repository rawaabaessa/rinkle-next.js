import type { AdminOrder } from "../orders/types";
export type Customer = { id: string; name: string; phone: string; orders: AdminOrder[]; total: number };
export function summarizeCustomers(orders: AdminOrder[]): Customer[] {
  const customers = new Map<string, Customer>();
  for (const order of [...orders].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))) {
    const digits = order.phone.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/\D/g, "").replace(/^00/, "");
    // Without a verified account ID/phone, matching names must not merge people.
    const id = digits.length >= 7 ? `phone:${digits}` : `order:${order.id}`;
    const current = customers.get(id) ?? { id, name: order.customer, phone: order.phone, orders: [], total: 0 };
    current.orders.push(order); current.total += order.total; customers.set(id, current);
  }
  return [...customers.values()];
}
