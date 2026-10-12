import { AdminIcon, type AdminIconName } from "./AdminIcon";

export function DashboardPlaceholder({ title, description, icon }: {
  title: string;
  description: string;
  icon: AdminIconName;
}) {
  return <>
    <div className="admin-page-heading">
      <div><p className="admin-eyebrow">مساحة إدارة المتجر</p><h1>{title}</h1><p>{description}</p></div>
      <span className="admin-soft-badge">قريبًا</span>
    </div>
    <section className="admin-panel admin-placeholder" aria-label={`مساحة ${title}`}>
      <span className="admin-placeholder-icon"><AdminIcon name={icon} /></span>
      <h2>مساحة جاهزة للخطوة الجاية</h2>
      <p>بنضيف تفاصيل هذا القسم لاحقًا.</p>
    </section>
  </>;
}
