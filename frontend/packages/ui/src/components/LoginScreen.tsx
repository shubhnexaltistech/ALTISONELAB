import { type FormEvent, type ReactNode } from "react";
import clsx from "clsx";
import { Button } from "./Button";
import { MaterialIcon } from "./MaterialIcon";

export type LoginVariant = "lms" | "mentor" | "admin";

export interface LoginField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  icon?: string;
  iconType?: "material" | "fontawesome";
}

export interface LoginScreenProps {
  variant?: LoginVariant;
  title: string;
  subtitle?: string;
  logo?: ReactNode;
  fields: LoginField[];
  error?: string;
  loading?: boolean;
  footer?: ReactNode;
  onSubmit: (values: Record<string, string>) => void;
}

export function LoginScreen({
  variant = "lms",
  title,
  subtitle,
  logo,
  fields,
  error,
  loading,
  footer,
  onSubmit,
}: LoginScreenProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    fields.forEach((field) => {
      values[field.name] = String(formData.get(field.name) ?? "");
    });
    onSubmit(values);
  };

  if (variant === "admin") {
    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-admin-bg p-4">
        <div className="flex w-full max-w-[900px] overflow-hidden rounded-2xl border border-white/10 bg-admin-card shadow-2xl animate-[fadeIn_0.4s_ease-out]">
          <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-primary/30 to-admin-bg p-12 md:flex">
            <div className="grid grid-cols-3 gap-6 text-3xl text-blue-400/60">
              <i className="fas fa-lock" />
              <i className="fas fa-cloud" />
              <i className="fas fa-cloud-arrow-up" />
              <i className="fas fa-gear" />
              <i className="fas fa-chart-bar" />
              <i className="fas fa-shield-halved" />
              <i className="fas fa-code col-start-2" />
            </div>
          </div>
          <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12">
            {logo && <div className="mb-7">{logo}</div>}
            <h1 className="text-2xl font-bold text-admin-text">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
            {error && (
              <div className="mt-4 rounded-lg bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-400">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {fields.map((field) => (
                <LoginFieldInput key={field.name} field={field} variant={variant} />
              ))}
              <Button type="submit" className="w-full justify-center" loading={loading}>
                Login <i className="fas fa-arrow-right ml-2" />
              </Button>
            </form>
            {footer ?? (
              <p className="mt-6 text-xs text-slate-500">
                <i className="fas fa-shield-halved mr-1.5 text-primary" />
                <strong>Security:</strong> Role-based redirect and secure access guaranteed.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "mentor") {
    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-[400px] rounded-xl bg-white p-8 shadow-login">
          <div className="mb-8 text-center">
            {logo ?? (
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light text-primary">
                <MaterialIcon name="terminal" size={28} />
              </div>
            )}
            <h2 className="text-xl font-semibold text-text-main">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
          </div>
          {error && (
            <div className="mb-4 rounded-md bg-red-100 px-3 py-2.5 text-center text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <LoginFieldInput key={field.name} field={field} variant={variant} />
            ))}
            <Button type="submit" className="w-full justify-center" loading={loading}>
              Sign In
            </Button>
          </form>
          {footer}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-bg-main p-4">
      <div className="w-full max-w-[400px] rounded-xl bg-surface p-8 shadow-login">
        <div className="mb-8 text-center">
          {logo}
          <h2 className="mt-4 text-xl font-semibold text-text-main">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
        </div>
        {error && (
          <div className="mb-4 rounded-md bg-[#fee2e2] px-3 py-2.5 text-center text-sm text-[#b91c1c]">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <LoginFieldInput key={field.name} field={field} variant={variant} />
          ))}
          <Button type="submit" className="w-full justify-center py-3 text-base" loading={loading}>
            Sign In
          </Button>
        </form>
        {footer}
      </div>
    </div>
  );
}

function LoginFieldInput({ field, variant }: { field: LoginField; variant: LoginVariant }) {
  const isAdmin = variant === "admin";

  return (
    <div>
      <label
        className={clsx(
          "mb-2 block text-xs font-bold",
          isAdmin ? "text-slate-400" : "text-slate-600"
        )}
      >
        {field.label}
      </label>
      <div className="relative">
        {field.icon && (
          <span
            className={clsx(
              "absolute left-3 top-1/2 -translate-y-1/2",
              isAdmin ? "text-slate-500" : "text-text-muted"
            )}
          >
            {field.iconType === "fontawesome" ? (
              <i className={field.icon} />
            ) : (
              <MaterialIcon name={field.icon} size={18} />
            )}
          </span>
        )}
        <input
          name={field.name}
          type={field.type ?? "text"}
          placeholder={field.placeholder}
          className={clsx(
            "w-full rounded-lg border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20",
            field.icon && "pl-10",
            isAdmin
              ? "border-white/10 bg-black/30 text-admin-text placeholder:text-slate-600"
              : "border-[#cbd5e1] bg-white text-text-main"
          )}
        />
      </div>
    </div>
  );
}
