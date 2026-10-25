"use client";
import { useState } from "react";

export function StaffLogout({ demo = false }: { demo?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setPending(true); setError("");
    try {
      const response = await fetch(demo ? "/api/auth/demo" : "/api/auth/staff/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: demo ? JSON.stringify({ action: "sign-out" }) : "{}" });
      if (!response.ok) throw new Error();
      // Full navigation discards cached protected RSC pages after revocation.
      window.location.replace("/admin/login");
    } catch { setError("تعذّر تسجيل الخروج. حاولي مجددًا."); setPending(false); }
  }
  return <div><button type="button" className="account-text-button" onClick={logout} disabled={pending}>{pending ? "جارٍ الخروج…" : "تسجيل الخروج"}</button>{error && <p role="alert">{error}</p>}</div>;
}
