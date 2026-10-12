import type { SVGProps } from "react";

export function OrderIcon({
  kind,
  ...props
}: SVGProps<SVGSVGElement> & {
  kind: "gift" | "bank" | "cash" | "upload" | "check" | "pin" | "card";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {kind === "gift" && (
        <>
          <path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13" />
          <path d="M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z" />
        </>
      )}
      {kind === "bank" && (
        <>
          <path d="m3 8 9-5 9 5H3Zm2 3v7m7-7v7m7-7v7M3 21h18" />
        </>
      )}
      {kind === "cash" && (
        <>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M5 9h1m12 6h1" />
        </>
      )}
      {kind === "upload" && (
        <>
          <path d="M12 16V3m-4 4 4-4 4 4M4 16v4h16v-4" />
        </>
      )}
      {kind === "check" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </>
      )}
      {kind === "pin" && (
        <>
          <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2" />
        </>
      )}
      {kind === "card" && (
        <>
          <rect x="2" y="5" width="20" height="14" rx="3" />
          <path d="M2 10h20M6 15h4" />
        </>
      )}
    </svg>
  );
}
