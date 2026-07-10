import clsx from "clsx";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-container text-on-surface-variant",
  success: "bg-[#d1fae5] text-[#065f46]",
  warning: "bg-[#fef3c7] text-[#92400e]",
  danger: "bg-error-container text-on-error-container",
  info: "bg-primary-light text-primary",
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-lg px-3 py-[0.35rem] text-[11px] font-bold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusBadge(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    pending: "warning",
    paid: "info",
    verified: "success",
    approved: "success",
    rejected: "danger",
    passed: "success",
    failed: "danger",
    graded: "success",
    in_review: "info",
    draft: "default",
  };
  return map[status] || "default";
}
