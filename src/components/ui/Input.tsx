import type { ComponentProps } from "react";
import { fieldClass } from "./controlStyles";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input {...props} className={`${fieldClass} ${className}`} />;
}
