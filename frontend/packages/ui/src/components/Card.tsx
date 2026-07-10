import { type ReactNode } from "react";
import clsx from "clsx";

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={clsx(
        "mb-6 rounded-card border border-border bg-surface shadow-card",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-h3 text-text-main">{title}</h3>
        {description && <p className="mt-1 text-body-sm text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
