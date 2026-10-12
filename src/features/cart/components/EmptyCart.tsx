import Link from "next/link";
import { BagIcon } from "@/components/ui/IconSet";
import { panelClass, focus } from "@/components/ui/controlStyles";

export function EmptyCart() {
  return (
    <div className={`${panelClass} py-16 text-center sm:py-24`}>
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-cocoa/5 text-cocoa">
        <BagIcon className="size-9" />
      </span>
      <h2 className="mt-6 text-2xl font-bold">سلتك تنتظر أول اختيار</h2>
      <p className="mt-3 text-muted">
        اختاري من مخبوزات رينكل، وخلي يومك أحلى.
      </p>
      <Link
        href="/products"
        className={`mt-7 inline-flex min-h-12 items-center rounded-full bg-cocoa px-8 font-bold text-white ${focus}`}
      >
        تصفّحي المنتجات
      </Link>
    </div>
  );
}
