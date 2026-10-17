"use client";
import Link from "next/link";
import { useCustomer } from "../accountStore";
import type { DeliveryArea } from "@/features/delivery/types";
import { useOrderDraft } from "@/features/checkout/useOrderDraft";

export function CheckoutAddresses({ areas, disabled }: { areas: DeliveryArea[]; disabled: boolean }) {
  const customer = useCustomer(); const { draft, updateDraft } = useOrderDraft();
  if (!customer) return null;
  return <div className="account-card !p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm">حسابك: <bdi className="font-medium">{customer.phone}</bdi></p><Link href="/account/addresses" className="account-text-button">إدارة العناوين</Link></div><p className="mb-4 text-xs leading-6 text-muted">يمكنك استخدام رقم تواصل مختلف لهذا الطلب. بيانات مستلم الهدية لا تغيّر حسابك.</p>{customer.addresses.length > 0 && <label className="account-label">استخدام عنوان محفوظ<select className="account-input" disabled={disabled} value={customer.addresses.find((address) => address.areaId === draft.deliveryAreaId && address.district === draft.district && address.address === draft.address)?.id ?? ""} onChange={(event) => { const address = customer.addresses.find((item) => item.id === event.target.value); if (address) updateDraft({ deliveryAreaId: address.areaId, city: areas.find((area) => area.id === address.areaId)?.name ?? "", district: address.district, address: address.address }); else updateDraft({ deliveryAreaId: "", city: "", district: "", address: "" }); }}><option value="">إدخال عنوان جديد</option>{customer.addresses.map((address) => { const area = areas.find((item) => item.id === address.areaId); return <option key={address.id} value={address.id} disabled={!area?.active}>{address.label} · {area?.name ?? "غير متاح"}{address.id === customer.defaultAddressId ? " · الافتراضي" : ""}{!area?.active ? " · غير متاح للتوصيل" : ""}</option>; })}</select></label>}</div>;
}
