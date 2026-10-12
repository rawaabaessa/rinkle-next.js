import { Input } from "@/components/ui/Input";
import type { FieldName } from "@/features/checkout/types";

export function Field({ name, label, value, onChange, error, placeholder, autoComplete }: { name: FieldName; label: string; value: string; onChange: (value: string) => void; error?: string; placeholder?: string; autoComplete?: string }) {
  const phone = name.endsWith("Phone");
  return <div className="min-w-0"><label htmlFor={name} className="mb-2 block text-sm font-medium">{label} <span className="text-accent" aria-hidden="true">*</span></label><Input id={name} name={name} required type={phone ? "tel" : "text"} dir={phone ? "ltr" : "auto"} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} maxLength={name === "address" ? 500 : 100} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} className={error ? "border-accent" : ""} />{error && <p id={`${name}-error`} className="mt-2 text-xs text-accent">{error}</p>}</div>;
}

export type CheckoutFields = { inputProps: (name: FieldName) => { name: FieldName; value: string; error?: string; onChange: (value: string) => void } };
