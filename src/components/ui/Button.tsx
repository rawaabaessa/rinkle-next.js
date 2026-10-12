import Link from "next/link";
import type { ComponentProps } from "react";
import { focus } from "./controlStyles";

export const buttonClass = `inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cocoa px-5 py-3 text-base font-bold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${focus}`;

type ButtonProps = ComponentProps<"button"> | ComponentProps<typeof Link>;

export function Button({ className = "", ...props }: ButtonProps) {
  const classes = `${buttonClass} ${className}`;
  return "href" in props
    ? <Link {...props} className={classes} />
    : <button {...props} className={classes} />;
}
