import type { AdminIconName } from "./components/AdminIcon";

type DashboardNavItem = { href: string; title: string; icon: AdminIconName };

export const dashboardNavigation: { title: string; items: DashboardNavItem[] }[] = [
  {
    title: "إدارة المتجر",
    items: [
      { href: "/dashboard", title: "الرئيسية", icon: "home" },
      { href: "/dashboard/orders", title: "الطلبات", icon: "orders" },
      { href: "/dashboard/products", title: "المنتجات", icon: "box" },
      { href: "/dashboard/categories", title: "الأقسام", icon: "categories" },
      { href: "/dashboard/delivery", title: "التوصيل", icon: "delivery" },
      { href: "/dashboard/customers", title: "العملاء", icon: "customers" },
    ],
  },
  {
    title: "التسويق والمتابعة",
    items: [
      { href: "/dashboard/offers", title: "العروض والكوبونات", icon: "offers" },
      { href: "/dashboard/reports", title: "التقارير", icon: "reports" },
    ],
  },
  {
    title: "إدارة النظام",
    items: [
      { href: "/dashboard/users", title: "المستخدمين", icon: "users" },
      { href: "/dashboard/permissions", title: "الصلاحيات", icon: "permissions" },
      { href: "/dashboard/settings", title: "إعدادات المتجر", icon: "settings" },
    ],
  },
];
