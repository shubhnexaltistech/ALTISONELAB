import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "@itp/ui";
import { useAuth } from "@itp/hooks";
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "fas fa-gauge-high", iconType: "fontawesome" as const },
  { to: "/applications", label: "Applications", icon: "fas fa-file-lines", iconType: "fontawesome" as const },
  { to: "/tracks", label: "Tracks", icon: "fas fa-layer-group", iconType: "fontawesome" as const },
  { to: "/modules", label: "Modules", icon: "fas fa-book", iconType: "fontawesome" as const },
  { to: "/mentors", label: "Mentors", icon: "fas fa-users", iconType: "fontawesome" as const },
  { to: "/employees", label: "Employees", icon: "fas fa-id-badge", iconType: "fontawesome" as const },
  { to: "/quizzes", label: "Quizzes", icon: "fas fa-circle-question", iconType: "fontawesome" as const },
  { to: "/announcements", label: "Announcements", icon: "fas fa-bullhorn", iconType: "fontawesome" as const },
  { to: "/analytics", label: "Analytics", icon: "fas fa-chart-line", iconType: "fontawesome" as const },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/applications": "Applications",
  "/tracks": "Tracks",
  "/modules": "Modules",
  "/mentors": "Mentors",
  "/employees": "Employees",
  "/quizzes": "Quizzes",
  "/announcements": "Announcements",
  "/analytics": "Analytics",
};

export function AdminLayout() {
  const { logout, userId, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <DashboardLayout
      variant="admin"
      subtitle="Admin Ecosystem"
      items={navItems}
      headerTitle={pageTitles[location.pathname] ?? "Dashboard"}
      showSearch={false}
      user={userId ? { name: user?.name ?? "Admin", id: user?.email ?? userId } : undefined}
      logo={
        <span className="text-lg font-bold text-admin-text">
          Nex<span className="text-blue-400">Altis</span>
        </span>
      }
      onLogout={handleLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
