"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronLeft, LockKeyhole, Pencil, Search, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { usePreviewDocument } from "../usePreviewDocument";
import { initialMembers, membersSchema, roles } from "../users/userData";
import { initialPermissions, permissionCodes, permissionGroups, permissionsSchema, roleDescriptions, samePermissions, type Role } from "./permissionData";
import { PermissionEditor } from "./PermissionEditor";

export function PermissionsManager() {
  const { value, loading, error, refresh, save } = usePreviewDocument("rinkle-permissions-preview-v1", permissionsSchema, initialPermissions);
  const team = usePreviewDocument("rinkle-team-preview-v1", membersSchema, initialMembers);
  const [role, setRole] = useState<Role>("owner");
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const groups = permissionGroups.filter((group) => `${group.name} ${group.description} ${group.actions.map((action) => action.label).join(" ")}`.includes(query.trim()));
  const grants = value[role];
  const available = !loading && !error;
  const membersCount = (key: Role) => team.loading || team.error ? "—" : team.value.filter((member) => member.role === key).length;
  return <div className="permissions-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">إدارة النظام / الصلاحيات</p><h1>لكل دور، مساحة واضحة</h1><p>نظّمي وصول الفريق، وخلي المسؤوليات أوضح للجميع.</p></div><Link href="/dashboard/users" className="admin-button admin-button-secondary"><Users size={18} />إدارة الفريق</Link></div>
    <section className="admin-kpis admin-product-kpis" aria-label="ملخص الصلاحيات">{[
      { label: "أدوار الفريق", value: Object.keys(roles).length, hint: "دور واحد لكل عضو", Icon: ShieldCheck },
      { label: "صلاحيات محددة", value: permissionCodes.length, hint: "موزعة على أقسام المتجر", Icon: SlidersHorizontal },
      { label: "أعضاء الفريق", value: team.loading || team.error ? "—" : team.value.length, hint: "من قائمة المستخدمين الحالية", Icon: Users },
      { label: "حساب المالكة", value: "محمي", hint: "وصول كامل لا يمكن إلغاؤه", Icon: LockKeyhole },
    ].map(({ label, value: count, hint, Icon }, index) => <article className={`admin-kpi${index === 0 ? " admin-kpi-featured" : ""}`} key={label}><div className="admin-kpi-heading"><h2>{label}</h2><Icon aria-hidden="true" /></div><p className="admin-kpi-value">{count}</p><p className="admin-kpi-hint">{hint}</p></article>)}</section>
    <p className="permission-preview"><ShieldCheck size={18} aria-hidden="true" /><span>توزيع مقترح قابل للتعديل. الحفظ محلي للمعاينة، ولا يغيّر الدخول أو الحماية الفعلية للمتجر.</span></p>
    {notice && <p className="admin-alert admin-alert-success" role="status">{notice}</p>}
    {team.error && <p className="admin-alert admin-alert-error" role="alert">تعذّر تحميل عدد أعضاء الأدوار.<button className="admin-retry" onClick={team.refresh}>إعادة المحاولة</button></p>}
    {error && <p className="admin-alert admin-alert-error" role="alert">{error}<button className="admin-retry" onClick={refresh}>إعادة المحاولة</button></p>}
    <div className="permissions-layout">
      <aside className="admin-panel permission-roles" aria-label="اختيار دور الفريق"><div className="admin-panel-heading"><h2>الأدوار</h2><span className="admin-soft-badge">{Object.keys(roles).length}</span></div><div className="permission-role-list">{(Object.keys(roles) as Role[]).map((key) => <button key={key} className="permission-role" aria-pressed={role === key} onClick={() => { setRole(key); setNotice(""); }}><span className="permission-role-symbol">{key === "owner" ? <LockKeyhole size={18} /> : <ShieldCheck size={18} />}</span><span><strong>{roles[key]}</strong><small>{membersCount(key)} أعضاء · {available ? value[key].length : "—"} صلاحية</small></span><ChevronLeft size={15} aria-hidden="true" /></button>)}</div><p className="permission-role-note">تغيير صلاحيات الدور ينطبق على جميع أعضائه عند الربط الفعلي.</p></aside>
      <section className="admin-panel admin-products-panel permission-matrix" aria-labelledby="role-permissions-title">
        <div className="permission-matrix-heading"><div><p className="admin-eyebrow">صلاحيات الدور</p><h2 id="role-permissions-title">{roles[role]}</h2><p>{roleDescriptions[role]}</p></div>{role === "owner" ? <span className="admin-owner-lock"><LockKeyhole size={16} />صلاحيات محمية</span> : <button type="button" className="admin-button" disabled={!available} onClick={() => setEditing(true)}><Pencil size={16} />تعديل الصلاحيات</button>}</div>
        <div className="permission-matrix-toolbar"><label className="admin-search"><Search aria-hidden="true" /><input type="search" aria-label="البحث في الصلاحيات" placeholder="ابحثي عن قسم أو صلاحية" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span>{available ? grants.length : "—"} من {permissionCodes.length} صلاحية مفعّلة</span></div>
        {loading ? <p className="admin-loading" role="status">جارٍ تحميل الصلاحيات…</p> : error ? <p className="admin-empty">أعيدي المحاولة لعرض الصلاحيات المحفوظة.</p> : !groups.length ? <div className="admin-empty"><Search /><h3>لا توجد صلاحيات مطابقة</h3><button className="admin-button admin-button-secondary" onClick={() => setQuery("")}>مسح البحث</button></div> : <div className="admin-table-scroll" tabIndex={0} role="region" aria-label={`جدول صلاحيات ${roles[role]}`}><table className="admin-table permission-table"><thead><tr><th scope="col">القسم</th><th scope="col">الوصول المتاح</th></tr></thead><tbody>{groups.map((group) => <tr key={group.id}><th scope="row"><strong>{group.name}</strong><small>{group.description}</small></th><td><div className="permission-grants">{group.actions.map((action) => <span key={action.code} className={`permission-grant${grants.includes(action.code) ? " is-granted" : ""}`}>{grants.includes(action.code) ? <Check size={14} aria-hidden="true" /> : <LockKeyhole size={13} aria-hidden="true" />}<span>{action.label}<span className="sr-only">: {grants.includes(action.code) ? "مسموح" : "غير مسموح"}</span></span></span>)}</div></td></tr>)}</tbody></table></div>}
        <div className="admin-table-footer"><span>المالكة تحتفظ بجميع الصلاحيات دائمًا</span><span>العرض أساس أي صلاحية تعديل</span></div>
      </section>
    </div>
    {editing && role !== "owner" && <PermissionEditor role={role} initial={grants} onClose={() => setEditing(false)} onSave={(next, baseline) => {
      save((current) => { if (!samePermissions(current[role], baseline)) throw new Error("تغيّرت صلاحيات هذا الدور في نافذة أخرى. أغلقي المحرر وأعيدي تحميل الصفحة قبل التعديل."); return { ...current, [role]: next }; });
      setNotice(`تم حفظ صلاحيات ${roles[role]} في هذا المتصفح. لم تتغيّر صلاحيات الدخول الفعلية.`);
    }} />}
  </div>;
}
