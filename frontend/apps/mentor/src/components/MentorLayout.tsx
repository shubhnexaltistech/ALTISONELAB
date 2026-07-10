import { LayoutDashboard, Users, ClipboardList, Star } from "lucide-react";
import { Sidebar, AppLayout } from "@itp/ui";
import { useAuth } from "@itp/hooks";
import { Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trainees", label: "Trainees", icon: Users },
  { to: "/worklogs", label: "Worklogs", icon: ClipboardList },
  { to: "/evaluations", label: "Evaluations", icon: Star },
];

export function MentorLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppLayout
      sidebar={
        <Sidebar title="AltisOne Mentor" subtitle="Mentor Portal" items={navItems} onLogout={handleLogout} />
      }
    >
      <Outlet />
    </AppLayout>
  );
}
