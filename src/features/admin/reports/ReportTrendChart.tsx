"use client";

import { useId } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { formatPrice } from "@/lib/formatPrice";
import { reportDateLabel, type ReportSeriesPoint } from "./reportData";

function ReportTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return <div className="admin-chart-tooltip" dir="rtl"><span>{reportDateLabel(String(label))}</span><strong>{formatPrice(Number(payload[0].value))}</strong><span>{payload[0].payload.count} طلبات</span></div>;
}
export function ReportTrendChart({ data }: { data: ReportSeriesPoint[] }) {
  const gradientId = useId().replace(/:/g, "");
  const axes = <><CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 7" /><XAxis dataKey="date" tickFormatter={reportDateLabel} axisLine={false} tickLine={false} minTickGap={42} tickMargin={12} height={42} tick={{ fill: "var(--muted)", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} width={52} tickCount={4} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(value: number) => new Intl.NumberFormat("ar-YE", { notation: "compact" }).format(value)} /><Tooltip content={ReportTooltip} cursor={{ stroke: "var(--cocoa)", strokeOpacity: 0.2, fill: "var(--page)" }} /></>;
  return <div className="report-chart" dir="ltr" role="group" aria-label="رسم قيمة الطلبات بالريال اليمني، مع جدول بديل أسفل الرسم"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 680, height: 280 }}>
    {data.length === 1 ? <BarChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }} accessibilityLayer>{axes}<Bar dataKey="value" name="قيمة الطلبات" fill="var(--cocoa)" maxBarSize={64} radius={[10, 10, 0, 0]} isAnimationActive={false} /></BarChart> : <AreaChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }} accessibilityLayer><defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--cocoa)" stopOpacity={0.18} /><stop offset="100%" stopColor="var(--cocoa)" stopOpacity={0.01} /></linearGradient></defs>{axes}<Area type="monotone" dataKey="value" name="قيمة الطلبات" stroke="var(--cocoa)" strokeWidth={2.5} fill={`url(#${gradientId})`} dot={data.length < 10 ? { r: 3 } : false} activeDot={{ r: 5, fill: "var(--cocoa)", stroke: "white", strokeWidth: 3 }} isAnimationActive={false} /></AreaChart>}
  </ResponsiveContainer></div>;
}
