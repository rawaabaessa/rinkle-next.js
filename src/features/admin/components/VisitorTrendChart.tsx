"use client";

import { useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { numberLabel, visitorHistory } from "../dashboardPreviewData";

const ranges = [{ days: 7, label: "7 أيام" }, { days: 30, label: "30 يومًا" }, { days: 90, label: "3 أشهر" }];
const dateLabel = (value: string, full = false) => new Intl.DateTimeFormat("ar-YE", {
  day: "numeric", month: "short", ...(full ? { weekday: "short" as const } : {}), timeZone: "UTC",
}).format(new Date(`${value}T12:00:00Z`));

function VisitorTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return <div className="admin-chart-tooltip" dir="rtl">
    <span>{dateLabel(String(label), true)}</span>
    <strong>{numberLabel(Number(payload[0].value))}<small>زائر</small></strong>
  </div>;
}

export function VisitorTrendChart() {
  const [days, setDays] = useState(7);
  const gradientId = useId().replace(/:/g, "");
  const data = visitorHistory.slice(-days);
  const total = data.reduce((sum, point) => sum + point.visitors, 0);
  return <section className="admin-panel admin-visitor-panel" aria-labelledby="visitor-title">
    <div className="admin-panel-heading">
      <div><p className="admin-eyebrow">زيارات المتجر</p><h2 id="visitor-title">كل زيارة، بداية حلوة</h2></div>
      <div className="admin-range-control" role="group" aria-label="الفترة الزمنية للزيارات">
        {ranges.map((range) => <button key={range.days} type="button" aria-pressed={days === range.days} onClick={() => setDays(range.days)}>{range.label}</button>)}
      </div>
    </div>
    <div className="admin-chart-summary" aria-live="polite">
      <strong>{numberLabel(total)}<span>إجمالي الزيارات اليومية</span></strong>
      <span>{dateLabel(data[0].date)} — {dateLabel(data.at(-1)!.date)}</span>
    </div>
    <div className="admin-visitors-chart" dir="ltr" role="group" aria-label={`منحنى الزيارات خلال ${days} يومًا، بيانات تجريبية`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 640, height: 260 }}>
        <AreaChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }} accessibilityLayer>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--cocoa)" stopOpacity={0.17} /><stop offset="100%" stopColor="var(--cocoa)" stopOpacity={0.01} /></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 7" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(value) => dateLabel(value)} minTickGap={35} tickMargin={14} height={40} interval="preserveStartEnd" />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={numberLabel} width={38} tickCount={4} allowDecimals={false} domain={[0, "auto"]} />
          <Tooltip content={VisitorTooltip} cursor={{ stroke: "var(--cocoa)", strokeOpacity: 0.2, strokeDasharray: "3 5" }} />
          <Area type="monotone" dataKey="visitors" name="الزوار" stroke="var(--cocoa)" strokeWidth={2.5} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 5, fill: "var(--cocoa)", stroke: "var(--surface)", strokeWidth: 3 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="admin-chart-footnote"><span><i />الزوار يوميًا</span><span>بيانات تجريبية · ليست زيارات فعلية</span></div>
    <details className="admin-chart-data"><summary>عرض بيانات الرسم</summary><div className="admin-chart-data-scroll"><table><caption className="sr-only">الزيارات اليومية التجريبية</caption><thead><tr><th scope="col">التاريخ</th><th scope="col">الزوار</th></tr></thead><tbody>{data.map((point) => <tr key={point.date}><td>{dateLabel(point.date, true)}</td><td>{numberLabel(point.visitors)}</td></tr>)}</tbody></table></div></details>
  </section>;
}
