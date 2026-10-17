"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";

const addressSchema = z.object({ id: z.string(), label: z.string().max(40), areaId: z.string(), district: z.string().max(100), address: z.string().max(500) });
const profileSchema = z.object({ phone: z.string(), name: z.string().max(100), addresses: z.array(addressSchema), defaultAddressId: z.string() });
const storeSchema = z.object({ active: z.string().nullable(), profiles: z.record(z.string(), profileSchema) });
export type SavedAddress = z.infer<typeof addressSchema>;
export type CustomerProfile = z.infer<typeof profileSchema>;
type Store = z.infer<typeof storeSchema>;
const empty: Store = { active: null, profiles: {} };
const key = "rinkle-customer-preview-v1";
const event = "rinkle-customer-preview-change";
let cached: Store | null = null;
function read() {
  if (cached) return cached;
  try { cached = storeSchema.parse(JSON.parse(sessionStorage.getItem(key) ?? "null")); }
  catch { cached = empty; }
  return cached;
}
function write(next: Store) {
  cached = next;
  try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* The preview remains usable in memory. */ }
  window.dispatchEvent(new Event(event));
}
function subscribe(callback: () => void) { window.addEventListener(event, callback); return () => window.removeEventListener(event, callback); }
export function normalizePhone(value: string) {
  const digits = value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/[\s()-]/g, "");
  return digits.startsWith("00") ? `+${digits.slice(2)}` : digits;
}
export const phoneSchema = z.string().transform(normalizePhone).pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "أدخلي رقم الجوال مع مفتاح الدولة، مثل +967 ثم رقمك."));
export function previewSignIn(phone: string, replacePhone = false) {
  const current = read();
  if (replacePhone && current.active && current.active !== phone && current.profiles[phone]) throw new Error("هذا الرقم مرتبط بحساب تجريبي آخر. سجّلي الخروج للدخول إليه.");
  const profile = replacePhone && current.active ? { ...current.profiles[current.active], phone } : current.profiles[phone] ?? { phone, name: "", addresses: [], defaultAddressId: "" };
  const profiles = { ...current.profiles, [phone]: profile };
  if (replacePhone && current.active !== phone && current.active) delete profiles[current.active];
  write({ active: phone, profiles });
}
export function previewSignOut() { write({ ...read(), active: null }); }
export function updateProfile(patch: Partial<Omit<CustomerProfile, "phone">>) {
  const current = read();
  if (!current.active) return;
  const profile = profileSchema.parse({ ...current.profiles[current.active], ...patch });
  write({ ...current, profiles: { ...current.profiles, [current.active]: profile } });
}
export function saveAddress(value: Omit<SavedAddress, "id"> & { id?: string }, makeDefault = false) {
  const current = read();
  const profile = current.active ? current.profiles[current.active] : null;
  if (!profile) return;
  const address = addressSchema.parse({ ...value, id: value.id ?? crypto.randomUUID() });
  const addresses = [...profile.addresses.filter((item) => item.id !== address.id), address];
  updateProfile({ addresses, defaultAddressId: makeDefault || !profile.defaultAddressId ? address.id : profile.defaultAddressId });
}
export function removeAddress(id: string) {
  const current = read(); const profile = current.active ? current.profiles[current.active] : null;
  if (!profile) return;
  const addresses = profile.addresses.filter((item) => item.id !== id);
  updateProfile({ addresses, defaultAddressId: profile.defaultAddressId === id ? addresses[0]?.id ?? "" : profile.defaultAddressId });
}
export function useCustomer() {
  const store = useSyncExternalStore(subscribe, read, () => empty);
  return store.active ? store.profiles[store.active] ?? null : null;
}
