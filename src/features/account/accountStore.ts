"use client";
export { normalizePhone, customerPhone as phoneSchema } from "@/lib/auth/policy";
export type SavedAddress = { id: string; label: string; areaId: string; district: string; address: string };
export type CustomerProfile = { phone: string; name: string; addresses: SavedAddress[]; defaultAddressId: string };
// Never treat sessionStorage or localStorage as identity. OTP is not enabled yet.
export function useCustomer(): CustomerProfile | null { return null; }
export async function signOutCustomer() {
  const response = await fetch("/api/auth/customer/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  if (!response.ok) throw new Error("CUSTOMER_AUTH_UNAVAILABLE");
}
function unavailable(): never { throw new Error("CUSTOMER_AUTH_UNAVAILABLE"); }
// Existing editors cannot write until the authenticated customer backend is wired.
export const updateProfile: (patch: Partial<Omit<CustomerProfile, "phone">>) => void = unavailable;
export const saveAddress: (value: Omit<SavedAddress, "id"> & { id?: string }, makeDefault?: boolean) => void = unavailable;
export const removeAddress: (id: string) => void = unavailable;
