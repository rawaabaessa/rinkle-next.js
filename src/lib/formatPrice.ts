export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ar-YE").format(price)} ر.ي`;
}
