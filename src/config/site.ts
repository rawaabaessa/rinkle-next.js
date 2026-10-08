export const siteConfig = {
  name: "Rinkle Bakery",
  logo: "/images/rinkle-logo-new.png",
  contact: {
    whatsapp: "https://wa.me/967739665833",
    instagram: "https://www.instagram.com/rinkle_cookies_/",
  },
  navigation: [
    { label: "الرئيسية", href: "/" },
    { label: "المنتجات", href: "/products" },
    { label: "طريقة الطلب", href: "/#how-it-works" },
    { label: "الأسئلة الشائعة", href: "/#faq" },
  ],
  footerNavigation: [
    { label: "الرئيسية", href: "/" },
    { label: "المنتجات", href: "/products" },
    { label: "طريقة الطلب", href: "/#how-it-works" },
    { label: "الأسئلة الشائعة", href: "/#faq" },
  ],
} as const;
