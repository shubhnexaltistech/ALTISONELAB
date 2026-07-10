import clsx from "clsx";
import { MaterialIcon } from "./MaterialIcon";
import type { PortalVariant } from "./Sidebar";

export interface HeaderProps {
  variant?: PortalVariant;
  title?: string;
  greeting?: string;
  searchPlaceholder?: string;
  onMenuToggle?: () => void;
  showSearch?: boolean;
}

const headerHeights: Record<PortalVariant, string> = {
  lms: "h-header-height",
  mentor: "h-mentor-header",
  admin: "h-admin-header",
};

const headerOffsets: Record<PortalVariant, string> = {
  lms: "left-sidebar-width",
  mentor: "left-mentor-sidebar",
  admin: "left-admin-sidebar",
};

export function Header({
  variant = "lms",
  title,
  greeting,
  searchPlaceholder = "Search modules, tasks...",
  onMenuToggle,
  showSearch = true,
}: HeaderProps) {
  const isAdmin = variant === "admin";

  return (
    <header
      className={clsx(
        "admin-header fixed right-0 top-0 z-[900] flex items-center justify-between border-b px-8 transition-[left] duration-300",
        headerHeights[variant],
        headerOffsets[variant],
        isAdmin
          ? "border-white/10 bg-[#06080A]/90 text-slate-50 backdrop-blur-md backdrop-saturate-150"
          : "border-border bg-white/80 text-text-main backdrop-blur-[10px]"
      )}
    >
      <div className="flex flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          className={clsx(
            "cursor-pointer border-none bg-transparent lg:hidden",
            isAdmin ? "text-slate-200 hover:text-white" : "text-text-main"
          )}
          aria-label="Toggle menu"
        >
          {isAdmin ? <i className="fas fa-bars text-lg" /> : <MaterialIcon name="menu" />}
        </button>

        {showSearch && !isAdmin && (
          <div className="relative hidden w-[250px] sm:block">
            <MaterialIcon
              name="search"
              size={18}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full rounded-[10px] border border-border bg-bg-main py-2 pl-9 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {title && (
          <h2
            className={clsx(
              "text-[15px] font-semibold tracking-tight",
              isAdmin ? "text-slate-50" : "text-text-main"
            )}
          >
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-6">
        {greeting && (
          <span
            className={clsx(
              "hidden text-[13px] font-medium sm:inline",
              isAdmin ? "text-slate-400" : "text-text-muted"
            )}
          >
            {greeting}
          </span>
        )}
        <div className="flex items-center gap-3">
          {!isAdmin && (
            <>
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent text-text-muted hover:text-primary"
                aria-label="Notifications"
              >
                <MaterialIcon name="notifications" size={22} />
              </button>
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent text-text-muted hover:text-primary"
                aria-label="Help"
              >
                <MaterialIcon name="help_outline" size={22} />
              </button>
            </>
          )}
          {isAdmin && (
            <button
              type="button"
              className="cursor-pointer border-none bg-transparent text-slate-400 hover:text-slate-200"
              aria-label="Notifications"
            >
              <i className="fas fa-bell" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
