import type { ReactNode } from "react";
export function AdminFormField({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return <div className="admin-field"><label htmlFor={id}>{label}</label>{children}{error && <p id={`${id}-error`} className="admin-field-error" role="alert">{error}</p>}</div>;
}
