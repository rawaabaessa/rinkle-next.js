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
  { name: "كوكيز", slug: "cookies", image: "/images/category-cookies.png", imageAlt: "كوكيز بقطع شوكولاتة مخبوزة حديثاً", note: "للّحظات اللي تحتاج شيء لذيذ" },
  { name: "كيك", slug: "cakes", image: "/images/category-cakes.png", imageAlt: "قطعة كيك شوكولاتة بطبقات غنية", note: "لكل مناسبة طعمها الخاص" },
  { name: "ورق عنب", slug: "grape-leaves", image: "/images/category-grape-leaves.png", imageAlt: "طبق ورق عنب محضّر بعناية مع الليمون", note: "لقمة مالحة على أصولها" },
  { name: "كب كيك", slug: "cupcakes", image: "/images/category-cupcakes.png", imageAlt: "قطع كب كيك شوكولاتة بكريمة غنية", note: "حلا صغير وفرحة كبيرة" },
  { name: "بوكسات", slug: "gift-boxes", image: "/images/category-gift-boxes.png", imageAlt: "بوكس هدية يحتوي تشكيلة كوكيز وحلويات", note: "هدية حلوة للي تحبينهم" },
];

export function categoryHref(slug: Category["slug"]) {
  return `/products?category=${encodeURIComponent(slug)}`;
}
