import { useState } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { MaterialIcon } from "./MaterialIcon";

export type PortalVariant = "lms" | "mentor" | "admin";

export interface NavItem {
  to: string;
  label: string;
  icon: string;
  iconType?: "material" | "fontawesome";
}

export interface SidebarUser {
  name: string;
  id?: string;
  avatarUrl?: string;
}

export interface SidebarProps {
  variant?: PortalVariant;
  logo?: React.ReactNode;
  subtitle?: string;
  items: NavItem[];
  user?: SidebarUser;
  onLogout?: () => void;
  open?: boolean;
  onClose?: () => void;
}

const sidebarWidths: Record<PortalVariant, string> = {
  lms: "w-sidebar-width",
  mentor: "w-mentor-sidebar",
  admin: "w-admin-sidebar",
};

export function Sidebar({
  variant = "lms",
  logo,
  subtitle,
  items,
  user,
  onLogout,
  open = false,
  onClose,
}: SidebarProps) {
  const isAdmin = variant === "admin";
  const isMentor = variant === "mentor";

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[999] bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          "admin-sidebar fixed left-0 top-0 z-[1000] flex h-screen flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          sidebarWidths[variant],
          isAdmin
            ? "border-r border-white/10 bg-admin-bg text-admin-text"
            : isMentor
              ? "border-r border-slate-200 bg-slate-100"
              : "border-r border-border bg-surface",
          "max-lg:-translate-x-full",
          open && "max-lg:translate-x-0 max-lg:shadow-sidebar"
        )}
      >
        <div className={clsx("px-6", isMentor ? "mb-8 py-6" : "py-6")}>
          {logo}
          {subtitle && (
            <p
              className={clsx(
                "mt-1 text-[11px] font-bold uppercase tracking-widest",
                isAdmin ? "text-slate-500" : "text-slate-400"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        <nav className={clsx("flex flex-1 flex-col", isMentor ? "gap-1" : "")}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  variant === "lms" && "nav-link-lms",
                  variant === "lms" && isActive && "active",
                  isMentor &&
                    clsx(
                      "mx-0 flex items-center gap-3 px-4 py-2 transition-all duration-200",
                      isActive
                        ? "border-l-[3px] border-blue-700 bg-white font-semibold text-blue-800"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    ),
                  isAdmin &&
                    clsx(
                      "mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-primary/20 text-blue-400"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )
                )
              }
            >
              {({ isActive }) => (
                <>
                  <NavIcon item={item} active={isActive} variant={variant} />
                  <span
                    className={clsx(
                      isMentor && "font-inter text-[13px] font-medium tracking-tight",
                      isAdmin && "text-sm"
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {(user || onLogout) && (
          <div
            className={clsx(
              "mt-auto border-t p-6",
              isAdmin ? "border-white/10" : "border-border"
            )}
          >
            {user && (
              <div className="mb-3 flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      isAdmin ? "bg-primary/20 text-blue-400" : "bg-primary-light text-primary"
                    )}
                  >
                    {user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className={clsx("text-xs font-bold", isAdmin && "text-slate-100")}>{user.name}</p>
                  {user.id && (
                    <p className={clsx("text-[0.65rem]", isAdmin ? "text-slate-500" : "text-text-muted")}>
                      ID: {user.id}
                    </p>
                  )}
                </div>
              </div>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className={clsx(
                  "flex w-full items-center gap-2 text-sm font-medium transition-colors",
                  isMentor
                    ? "text-[#ef4444] hover:bg-[#fee2e2] px-2 py-1.5 rounded-lg"
                    : isAdmin
                      ? "text-slate-400 hover:text-red-400"
                      : "text-text-muted hover:text-primary"
                )}
              >
                {variant !== "admin" && <MaterialIcon name="logout" size={18} />}
                {variant === "admin" && <i className="fas fa-right-from-bracket" />}
                Sign out
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

function NavIcon({
  item,
  active,
  variant,
}: {
  item: NavItem;
  active: boolean;
  variant: PortalVariant;
}) {
  if (item.iconType === "fontawesome" || variant === "admin") {
    return <i className={clsx(item.icon, "w-5 text-center")} />;
  }
  return <MaterialIcon name={item.icon} size={22} filled={active && variant === "mentor"} />;
}

export function useSidebarState() {
  const [open, setOpen] = useState(false);
  return {
    open,
    toggle: () => setOpen((v) => !v),
    close: () => setOpen(false),
  };
}
