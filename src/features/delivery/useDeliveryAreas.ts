"use client";

import { useEffect, useState } from "react";
import { deliveryAreasTransaction, deliveryChangeEvent, deliveryChannel } from "./deliveryStore";
import type { DeliveryArea } from "./types";

export function useDeliveryAreas() {
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    let generation = 0;
    const read = async () => {
      const current = ++generation;
      try { const value = await deliveryAreasTransaction(); if (active && current === generation) { setAreas(value); setError(""); } }
      catch { if (active && current === generation) setError("تعذّر تحميل مناطق التوصيل. تأكدي من إتاحة التخزين وأعيدي المحاولة."); }
      finally { if (active && current === generation) setLoading(false); }
    };
    void read();
    window.addEventListener("focus", read); window.addEventListener(deliveryChangeEvent, read);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(deliveryChannel) : null;
    if (channel) channel.onmessage = read;
    return () => { active = false; window.removeEventListener("focus", read); window.removeEventListener(deliveryChangeEvent, read); channel?.close(); };
  }, [revision]);
  return { areas, loading, error, retry: () => setRevision((value) => value + 1) };
}
