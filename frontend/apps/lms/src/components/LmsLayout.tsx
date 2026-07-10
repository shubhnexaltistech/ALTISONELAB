import { LayoutDashboard, BookOpen, ClipboardList, User, Trophy, FileCheck } from "lucide-react";
import { Sidebar, AppLayout } from "@itp/ui";
import { useAuth } from "@itp/hooks";
import { Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/modules", label: "Modules", icon: BookOpen },
  { to: "/worklogs", label: "Worklogs", icon: ClipboardList },
  { to: "/evaluations", label: "Evaluations", icon: FileCheck },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

export function LmsLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppLayout
      sidebar={
        <Sidebar title="AltisOne LMS" subtitle="Trainee Portal" items={navItems} onLogout={handleLogout} />
      }
    >
      <Outlet />
    </AppLayout>
  );
}
