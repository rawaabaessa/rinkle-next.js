"use client";

import { useEffect, useRef, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, RotateCcw, X } from "lucide-react";
import { roles } from "../users/userData";
import { initialPermissions, permissionFormSchema, permissionGroups, togglePermission, type PermissionCode, type Role } from "./permissionData";

export function PermissionEditor({ role, initial, onSave, onClose }: {
  role: Exclude<Role, "owner">; initial: PermissionCode[];
  onSave: (next: PermissionCode[], baseline: PermissionCode[]) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [baseline] = useState(() => [...initial]);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState("");
  const { control, handleSubmit, formState: { isDirty, errors }, setValue } = useForm({
    resolver: zodResolver(permissionFormSchema), defaultValues: { permissions: baseline },
  });
  const { field } = useController({ name: "permissions", control });
  useEffect(() => { dialog.current?.showModal(); }, []);
  function close() { if (isDirty) setDiscard(true); else dialog.current?.close(); }
  return <dialog ref={dialog} className="admin-order-dialog permission-dialog" aria-labelledby="permission-editor-title" onClose={onClose} onCancel={(event) => { event.preventDefault(); close(); }}>
    <div className="admin-order-dialog-heading"><div><p className="admin-eyebrow">تعديل الدور</p><h2 id="permission-editor-title">{roles[role]}</h2><p>تغييرات تجريبية على هذا المتصفح فقط.</p></div><button className="admin-icon-button" type="button" aria-label="إغلاق تعديل الصلاحيات" onClick={close} autoFocus><X size={19} /></button></div>
    <form onSubmit={(event) => { void handleSubmit(({ permissions }) => {
      try { onSave(permissions, baseline); dialog.current?.close(); }
      catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر الحفظ. حاولي مجددًا."); }
    })(event); }} className="admin-order-dialog-body">
      <p className="permission-editor-hint">تفعيل التعديل يفعّل العرض معه. إلغاء العرض يلغي بقية صلاحيات القسم.</p>
      <div className="permission-editor-groups">{permissionGroups.map((group) => <fieldset key={group.id}><legend>{group.name}</legend><div>{group.actions.map((action) => <label key={action.code} className="permission-choice"><input type="checkbox" checked={field.value.includes(action.code)} onChange={(event) => { field.onChange(togglePermission(field.value, action.code, event.target.checked)); setDiscard(false); setError(""); }} /><span>{action.label}</span></label>)}</div></fieldset>)}</div>
      {(error || errors.permissions) && <p className="admin-alert admin-alert-error" role="alert">{error || errors.permissions?.message}</p>}
      {discard && <div className="permission-discard" role="alert"><p>لديك تغييرات لم تُحفظ. هل تريدين إغلاق النافذة وتجاهلها؟</p><div><button type="button" className="admin-button admin-button-secondary" onClick={() => setDiscard(false)}>متابعة التعديل</button><button type="button" className="admin-button" onClick={() => dialog.current?.close()}>تجاهل وإغلاق</button></div></div>}
      <div className="permission-editor-actions"><button type="button" className="admin-text-link" onClick={() => { setValue("permissions", [...initialPermissions[role]], { shouldDirty: true, shouldValidate: true }); setError(""); }}><RotateCcw size={16} />استعادة التوزيع المقترح</button><button type="submit" className="admin-button" disabled={!isDirty}><Check size={17} />حفظ الصلاحيات</button></div>
    </form>
  </dialog>;
}
