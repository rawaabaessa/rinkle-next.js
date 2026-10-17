"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { LoginDialog } from "./LoginDialog";

type LoginRequest = { destination: string; changePhone: boolean };
const LoginContext = createContext<(destination?: string, changePhone?: boolean) => void>(() => {});
export function CustomerProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<LoginRequest | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  function close() { setRequest(null); requestAnimationFrame(() => trigger.current?.focus()); }
  return <LoginContext.Provider value={(destination = "/account", changePhone = false) => { trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setRequest({ destination, changePhone }); }}>
    {children}
    {request && <LoginDialog destination={request.destination} changePhone={request.changePhone} onClose={close} />}
  </LoginContext.Provider>;
}
export function useCustomerLogin() { return useContext(LoginContext); }
