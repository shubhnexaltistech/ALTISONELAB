import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-btn border-none font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-white hover:-translate-y-px hover:opacity-90": variant === "primary",
          "bg-surface-container-low text-on-surface hover:bg-surface-container": variant === "secondary",
          "border border-border bg-white text-text-main hover:bg-bg-main": variant === "outline",
          "text-text-muted hover:bg-primary-light hover:text-primary": variant === "ghost",
          "bg-error text-white hover:opacity-90": variant === "danger",
          "px-3.5 py-[7px] text-xs": size === "sm",
          "px-6 py-3 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-pulse rounded-full bg-current opacity-50" />
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";
