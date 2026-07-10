import { type ReactNode } from "react";
import clsx from "clsx";
import { Card } from "./Card";

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  iconBg?: string;
  iconColor?: string;
  badge?: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}

export function StatCard({
  label,
  value,
  subValue,
  icon,
  iconBg = "bg-primary-light",
  iconColor = "text-primary",
  badge,
  className,
  tone = "light",
}: StatCardProps) {
  const isDark = tone === "dark";

  return (
    <Card
      className={clsx(
        "stat-card mb-0",
        isDark && "border-white/10 bg-admin-card text-admin-text",
        className
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        {icon && (
          <div className={clsx("rounded-lg p-2", iconBg, iconColor)}>{icon}</div>
        )}
        {badge}
      </div>
      <span className={clsx("stat-label", isDark && "!text-slate-400")}>{label}</span>
      <h3 className={clsx("text-2xl font-bold", isDark ? "text-slate-50" : "text-text-main")}>
        {value}
        {subValue && (
          <span className={clsx("ml-1 text-xs font-medium", isDark ? "text-slate-400" : "text-text-light")}>
            {subValue}
          </span>
        )}
      </h3>
    </Card>
  );
}
