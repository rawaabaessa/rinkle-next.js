"use client";
import { useCallback, useEffect, useState } from "react";
import type { ZodType } from "zod";

// Small, versioned local documents for dashboard previews; never authentication.
export function usePreviewDocument<T>(key: string, schema: ZodType<T>, initial: T) {
  const [value, setValue] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const read = useCallback(() => {
    const raw = localStorage.getItem(key);
    return raw === null ? initial : schema.parse(JSON.parse(raw));
  }, [key, schema, initial]);
  const refresh = useCallback(() => {
    try { setValue(read()); setError(""); }
    catch { setError("تعذّر قراءة البيانات المحلية. تحققي من إتاحة التخزين ثم أعيدي المحاولة."); }
    finally { setLoading(false); }
  }, [read]);
  useEffect(() => {
    const initialize = async () => refresh(); void initialize();
    const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) refresh(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, refresh]);
  function save(change: T | ((current: T) => T)) {
    const current = read();
    const next = schema.parse(typeof change === "function" ? (change as (current: T) => T)(current) : change);
    localStorage.setItem(key, JSON.stringify(next));
    setValue(next); setError("");
  }
  return { value, loading, error, refresh, save };
}
