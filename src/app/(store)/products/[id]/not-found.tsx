import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function ProductNotFound() {
  return <Container className="py-24 text-center"><h1 className="text-3xl font-bold">ما لقينا هذا المنتج</h1><p className="mt-4 text-muted">تصفّحي تشكيلتنا واختاري شي يحلّي يومك.</p><Link href="/products" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-cocoa px-7 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">العودة للمنتجات</Link></Container>;
}
