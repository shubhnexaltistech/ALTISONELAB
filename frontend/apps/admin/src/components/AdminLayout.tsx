import { LayoutDashboard, FileText, Layers, BookOpen, Users, HelpCircle, Megaphone, BarChart3 } from "lucide-react";
import { Sidebar, AppLayout } from "@itp/ui";
import { useAuth } from "@itp/hooks";
import { Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/tracks", label: "Tracks", icon: Layers },
  { to: "/modules", label: "Modules", icon: BookOpen },
  { to: "/mentors", label: "Mentors", icon: Users },
  { to: "/quizzes", label: "Quizzes", icon: HelpCircle },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppLayout
      sidebar={
        <Sidebar title="AltisOne Admin" subtitle="Management Portal" items={navItems} onLogout={handleLogout} />
      }
    >
      <Outlet />
    </AppLayout>
  );
}
