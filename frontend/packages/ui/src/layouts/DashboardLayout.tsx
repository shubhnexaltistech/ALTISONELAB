import { Outlet } from "react-router-dom";
import clsx from "clsx";
import { Header } from "../components/Header";
import { Sidebar, useSidebarState, type PortalVariant, type SidebarProps } from "../components/Sidebar";

export interface DashboardLayoutProps extends Omit<SidebarProps, "open" | "onClose"> {
  variant?: PortalVariant;
  headerTitle?: string;
  greeting?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  children?: React.ReactNode;
}

const contentOffsets: Record<PortalVariant, { margin: string; padding: string }> = {
  lms: { margin: "ml-0 lg:ml-sidebar-width", padding: "pt-header-height" },
  mentor: { margin: "ml-0 lg:ml-mentor-sidebar", padding: "pt-mentor-header" },
  admin: { margin: "ml-0 lg:ml-admin-sidebar", padding: "pt-admin-header" },
};

export function DashboardLayout({
  variant = "lms",
  headerTitle,
  greeting,
  searchPlaceholder,
  showSearch,
  children,
  ...sidebarProps
}: DashboardLayoutProps) {
  const { open, toggle, close } = useSidebarState();
  const offsets = contentOffsets[variant];

  return (
    <div
      className={clsx(
        "flex min-h-screen",
        variant === "admin" ? "admin-shell bg-admin-bg text-admin-text" : "bg-bg-main"
      )}
    >
      <Sidebar variant={variant} open={open} onClose={close} {...sidebarProps} />
      <div className={clsx("flex min-h-screen flex-1 flex-col transition-[margin] duration-300", offsets.margin)}>
        <Header
          variant={variant}
          title={headerTitle}
          greeting={greeting}
          searchPlaceholder={searchPlaceholder}
          showSearch={showSearch}
          onMenuToggle={toggle}
        />
        <main
          className={clsx(
            offsets.padding,
            "p-8 max-lg:p-6 fade-in",
            variant === "admin" && "admin-portal"
          )}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

export function AppShell(props: DashboardLayoutProps) {
  return <DashboardLayout {...props} />;
}

export function AppLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-main">
      {sidebar}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
