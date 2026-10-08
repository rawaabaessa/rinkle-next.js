export const productCategories = [
  { slug: "all", name: "الكل" },
  { slug: "available-today", name: "متوفر اليوم" },
  { slug: "cupcakes", name: "كب كيك" },
  { slug: "cookies", name: "كوكيز" },
  { slug: "cookie-cakes", name: "كيك كوكيز" },
  { slug: "grape-leaves", name: "ورق عنب" },
  { slug: "occasions", name: "مناسبات" },
] as const;

export type ProductCategory = (typeof productCategories)[number]["slug"];
export type ProductSize = {
  id: string;
  diameterCm: number;
  servings?: string;
  price?: number;
};

// Serving counts supplied by the bakery; prices are temporary preview values.
const cookieCakeSizes: ProductSize[] = [
  { id: "10-cm", diameterCm: 10, servings: "شخصين", price: 3000 },
  { id: "14-cm", diameterCm: 14, servings: "5 أشخاص", price: 5000 },
  { id: "22-cm", diameterCm: 22, servings: "8 أشخاص", price: 8000 },
  { id: "24-cm", diameterCm: 24, servings: "10 أشخاص", price: 10000 },
];

export type Product = {
  id: string;
  name: string;
  category: Exclude<ProductCategory, "all" | "available-today">;
  description: string;
  image: string;
  images?: { src: string; alt: string }[];
  details?: string;
  writing?: { maxLength: number };
  deliveryEstimate?: string;
  price: number;
  sizes?: ProductSize[];
  photo?: boolean;
  // Set true only when this product is ready for same-day delivery.
  // Unspecified availability is treated as unavailable, including preview data.
  availableToday?: boolean;
};

const image = (time: string) => `/images/products/ChatGPT Image Oct 3, 2026, ${time} PM.png`;

// Preview catalog only: replace names, portions, prices and currency with the
// merchant's approved catalog before enabling orders or payment.
export const catalogIsPreview = true;
export const products: Product[] = [
  { id: "cookie-bites", name: "بايتس كوكيز مع الصوص", category: "cookies", description: "كوكيز صغيرة، ولحظات حلوة كثيرة", image: image("06_07_22"), price: 4500 },
  { id: "chocolate-cupcake", name: "كب كيك الشوكولاتة", category: "cupcakes", description: "قلب كريمي وطبقة شوكولاتة غنية", image: "/images/categories/cupcake.png", price: 2500, photo: true },
  { id: "marble-cookie-cake", name: "كيك كوكيز الماربل", category: "cookie-cakes", description: "كوكيز طريّة مع مزيج الشوكولاتة", details: "كيك كوكيز يجمع طراوة الكوكيز ومزيج الشوكولاتة في كل قطعة. اختيار حلو للمشاركة في جمعتك، أو لإهدائه لشخص تحبينه. أضيفي عبارتك الخاصة وخلي اللحظة أحلى.", image: image("06_23_31"), price: 8000, sizes: cookieCakeSizes, writing: { maxLength: 40 }, deliveryEstimate: "خلال 24–48 ساعة من تأكيد الطلب" },
  { id: "grape-leaves-box", name: "بوكس ورق عنب", category: "grape-leaves", description: "لفّات ورق عنب بطعم دبس الرمان", image: image("06_18_51"), price: 5000 },
  { id: "caramel-cookie-cake", name: "كيك كوكيز الكراميل", category: "cookie-cakes", description: "شوكولاتة وكراميل وقرمشة لذيذة", image: image("06_05_31"), price: 8500, sizes: cookieCakeSizes, writing: { maxLength: 40 }, deliveryEstimate: "خلال 24–48 ساعة من تأكيد الطلب" },
  { id: "cookie-sharing-box", name: "تشكيلة الكوكيز", category: "cookies", description: "تشكيلة للمشاركة مع اللي تحبينهم", image: "/images/categories/cookies.png", price: 6500, photo: true },
  { id: "chocolate-cookie-cake", name: "كيك كوكيز الشوكولاتة", category: "cookie-cakes", description: "لعشّاق الشوكولاتة بكل تفاصيلها", image: image("06_27_18"), price: 8500, sizes: cookieCakeSizes, writing: { maxLength: 40 }, deliveryEstimate: "خلال 24–48 ساعة من تأكيد الطلب" },
  { id: "grape-leaves-tray", name: "صينية ورق عنب", category: "grape-leaves", description: "صينية تجمع اللمة والطعم الحلو", image: image("06_27_36"), price: 9500 },
  { id: "occasion-selection", name: "ضيافة المناسبات", category: "occasions", description: "تشكيلة حلوة تكمل فرحة مناسبتك", image: "/images/categories/giftbox.png", price: 15000, photo: true },
];

export function resolveCategory(value: string | null): ProductCategory {
  // Keep the existing home-page category links working.
  if (value === "cakes") return "cookie-cakes";
  if (value === "gift-boxes") return "occasions";
  return productCategories.find((category) => category.slug === value)?.slug ?? "all";
}

export function matchesProductCategory(product: Product, category: ProductCategory) {
  if (category === "all") return true;
  if (category === "available-today") return product.availableToday === true;
  return product.category === category;
}

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ar-YE").format(price)} ر.ي`;
}

export function startingPrice(product: Product) {
  return product.sizes?.length
    ? Math.min(...product.sizes.map((size) => size.price ?? product.price))
    : product.price;
}
