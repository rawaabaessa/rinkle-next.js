import {
  Gift, ArrowLeft, ChartNoAxesCombined, Check, Clock, ClipboardList, ExternalLink,
  Flame, Image, LayoutDashboard, LayoutGrid, Menu, Package, Pencil, Plus,
  Ruler, Search, Settings, ShieldCheck, Store, TicketPercent, Truck, Type,
  UserRound, UsersRound, X, CalendarDays, Wallet, MousePointer2, type LucideProps,
} from "lucide-react";

const icons = {
  gift: Gift, home: LayoutDashboard, box: Package, plus: Plus, arrow: ArrowLeft,
  search: Search, edit: Pencil, check: Check, clock: Clock, image: Image,
  close: X, writing: Type, candle: Flame, external: ExternalLink,
  store: Store, size: Ruler, orders: ClipboardList, categories: LayoutGrid,
  delivery: Truck, customers: UserRound, users: UsersRound,
  permissions: ShieldCheck, offers: TicketPercent, reports: ChartNoAxesCombined,
  settings: Settings, menu: Menu, calendar: CalendarDays, wallet: Wallet, conversion: MousePointer2,
};

export type AdminIconName = keyof typeof icons;

export function AdminIcon({ name, ...props }: LucideProps & { name: AdminIconName }) {
  const Icon = icons[name];
  return <Icon size={24} strokeWidth={1.7} aria-hidden="true" {...props} />;
}
