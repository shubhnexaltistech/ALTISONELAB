import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "@itp/ui";
import { useAuth } from "@itp/hooks";
import { useNavigate } from "react-router-dom";

const LOGO_URL = "/img/A1_logo_bg.png";

const navItems = [
  { to: "/", label: "Overview", icon: "dashboard" },
  { to: "/trainees", label: "Trainee Management", icon: "groups" },
  { to: "/evaluations", label: "Evaluations", icon: "rule" },
  { to: "/worklogs", label: "Work Logs", icon: "book_open" },
  { to: "/announcements", label: "Announcements", icon: "campaign" },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/trainees": "Trainee Management",
  "/evaluations": "Evaluations",
  "/worklogs": "Work Logs",
  "/announcements": "Announcements",
};

export function MentorLayout() {
  const { logout, userId, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <DashboardLayout
      variant="mentor"
      subtitle="Mentor Portal"
      items={navItems}
      headerTitle={pageTitles[location.pathname] ?? "Dashboard"}
      showSearch
      searchPlaceholder="Search trainees, modules..."
      user={userId ? { name: user?.name ?? "Mentor", id: user?.emp_id ?? userId } : undefined}
      logo={<img src={LOGO_URL} alt="AltisOne" className="h-[50px] w-[150px] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
      onLogout={handleLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
