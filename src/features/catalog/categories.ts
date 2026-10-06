export type Category = {
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  note: string;
};

// Static storefront data for now. Replace this module with a catalog service
// when products and categories are connected to a database or CMS.
export const categories: Category[] = [
  {
    name: "كوكيز",
    slug: "cookies",
    image: "/images/categories/cookies.png",
    imageAlt: "كوكيز بقطع شوكولاتة مخبوزة حديثاً",
    note: "كوكيز بالشوكلاتة البلجيكية يعدل مزاجك",
  },
  {
    name: "كيك",
    slug: "cakes",
    image: "/images/categories/cake.png",
    imageAlt: "كيك مزين بالشوكولاتة والكراميل",
    note: "كيكات تفتح النفس و تناسب كل مناسبة",
  },
  {
    name: "ورق عنب",
    slug: "grape-leaves",
    image: "/images/categories/leaves.png",
    imageAlt: "طبق ورق عنب محضّر بعناية مع الليمون",
    note: "ورق عنب بدبس الرمان على اصوله",
  },
  {
    name: "كب كيك",
    slug: "cupcakes",
    image: "/images/categories/cupcake.png",
    imageAlt: "قطع كب كيك شوكولاتة بكريمة غنية",
    note: "تشكلية كب كيك على كيفك",
  },
  {
    name: "بوكسات",
    slug: "gift-boxes",
    image: "/images/categories/giftbox.png",
    imageAlt: "بوكس هدية يحتوي تشكيلة كوكيز وحلويات",
    note: "توزيعات ضيافة مرتبة للمناسبات",
  },
];

export function categoryHref(slug: Category["slug"]) {
  return `/products?category=${encodeURIComponent(slug)}`;
}
