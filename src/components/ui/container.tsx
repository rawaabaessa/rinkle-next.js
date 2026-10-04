import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-[calc(100%-32px)] max-w-[1280px] min-[601px]:w-[calc(100%-48px)] ${className}`}>{children}</div>;
}
