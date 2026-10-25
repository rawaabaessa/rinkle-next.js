-- مقترح للمراجعة فقط؛ لم ينفذ ولا يستدعى من البناء أو الترحيلات.
-- المرجع: Rinkle-Database-Design.pdf ص25 و74.
-- الأسماء العربية وصفية، ولا تعني اعتماد منح صلاحيات لأي دور.
-- لا ينشئ حساب مالكة أو موظفة أو عميل، ولا يكتب إلى role_permissions.
BEGIN;

INSERT INTO public.roles (code, name, description) VALUES
  ('owner', 'مالكة المتجر', ' مالكة المتجر.'),
  ('manager', 'مديرة المتجر', 'متابعة تشغيل المتجر.'),
  ('orders', 'مسؤولة الطلبات', 'متابعة الطلبات وتجهيزها.'),
  ('catalog', 'مسؤولة المنتجات', 'تنظيم المنتجات والأقسام.'),
  ('delivery', 'مسؤولة التوصيل', 'متابعة توصيل الطلبات.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.permissions (code, name) VALUES
  ('dashboard.view', 'عرض الملخص'),
  ('orders.view', 'عرض الطلبات'),
  ('orders.update', 'تحديث حالة الطلب'),
  ('products.view', 'عرض المنتجات'),
  ('products.create', 'إضافة منتج'),
  ('products.update', 'تعديل المنتجات'),
  ('categories.view', 'عرض الأقسام'),
  ('categories.manage', 'إدارة الأقسام'),
  ('delivery.view', 'عرض التوصيل'),
  ('delivery.update', 'تحديث حالة التوصيل'),
  ('delivery.manage', 'إدارة المناطق والأسعار'),
  ('customers.view', 'عرض العملاء'),
  ('offers.view', 'عرض العروض والكوبونات'),
  ('reports.view', 'عرض التقارير'),
  ('reports.export', 'تصدير التقارير'),
  ('users.view', 'عرض الفريق'),
  ('users.manage', 'إدارة أعضاء الفريق'),
  ('permissions.view', 'عرض الصلاحيات'),
  ('permissions.manage', 'تعديل الصلاحيات'),
  ('settings.view', 'عرض الإعدادات'),
  ('settings.update', 'تعديل الإعدادات')
ON CONFLICT (code) DO NOTHING;

COMMIT;
