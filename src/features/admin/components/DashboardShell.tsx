"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { AdminCatalogProvider, useAdminCatalog } from "../AdminCatalogProvider";
import { AdminIcon } from "./AdminIcon";
import { AdminOrdersProvider } from "../orders/AdminOrdersProvider";
import { dashboardNavigation } from "../navigation";
import { can, dashboardPermission, type StaffPrincipal } from "@/lib/auth/policy";
import { StaffLogout } from "./StaffLogout";

function Shell({ children, staff }: { children: ReactNode; staff: StaffPrincipal }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const currentPage = dashboardNavigation.flatMap((group) => group.items).find((item) => item.href === "/dashboard" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  const { error, notice } = useAdminCatalog();
  return <div className="admin-shell">
    <a href="#dashboard-main" className="admin-skip">تخطي إلى المحتوى</a>
    <aside className={`admin-sidebar${menuOpen ? " is-menu-open" : ""}`}>
      <Link href="/dashboard" aria-label="رينكل، لوحة الإدارة" className="admin-logo"><Image src={siteConfig.logo} width={146} height={49} alt="Rinkle" priority /><span>مساحة إدارة المتجر</span></Link>
      <button ref={menuToggle} type="button" className="admin-menu-toggle" aria-expanded={menuOpen} aria-controls="dashboard-navigation" onClick={() => setMenuOpen(!menuOpen)}><AdminIcon name={menuOpen ? "close" : "menu"} />{menuOpen ? "إغلاق القائمة" : "أقسام الداشبورد"}</button>
      <nav id="dashboard-navigation" aria-label="تنقل لوحة الإدارة" className="admin-nav" onKeyDown={(event) => { if (event.key === "Escape" && menuOpen) { setMenuOpen(false); menuToggle.current?.focus(); } }}>
        {dashboardNavigation.map((group) => <div className="admin-nav-group" key={group.title}>
          <p className="admin-nav-label">{group.title}</p>
          {group.items.filter((item) => { const permission = dashboardPermission(item.href); return permission && can(staff, permission); }).map((item) => <Link key={item.href} href={item.href} aria-current={currentPage?.href === item.href ? "page" : undefined} onClick={() => setMenuOpen(false)}><AdminIcon name={item.icon} /><span>{item.title}</span></Link>)}
        </div>)}
      </nav>
    </aside>
    <div className="admin-workspace-main">
      <header className="admin-topbar"><div><span className="admin-breadcrumb">رينكل بيكري <span>/</span> {currentPage?.title ?? "لوحة الإدارة"}</span></div><div className="admin-topbar-end"><span>{staff.name}</span><StaffLogout demo={staff.id === "local-demo-owner"} /></div></header>
      <main id="dashboard-main" className="admin-main">{error && <div role="alert" className="admin-alert admin-alert-error">{error}</div>}{notice && <p className="admin-alert admin-alert-success" role="status"><AdminIcon name="check" />{notice}</p>}{children}</main>
      <footer className="admin-footer"><span>رينكل بيكري <span aria-hidden="true">·</span> صُنع بحب، ويُدار بكل بساطة.</span><span>معاينة محلية · التغييرات لا تُنشر في المتجر بعد</span></footer>
    </div>
  </div>;
}

export function DashboardShell({ children, staff }: { children: ReactNode; staff: StaffPrincipal }) {
  return <AdminCatalogProvider><AdminOrdersProvider><Shell staff={staff}>{children}</Shell></AdminOrdersProvider></AdminCatalogProvider>;
}
