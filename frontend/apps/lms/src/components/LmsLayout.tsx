import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "@itp/ui";
import { useAuth } from "@itp/hooks";
import { useNavigate } from "react-router-dom";

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida/ADBb0uiOtVs5OOkDusuvshDBQS55FnGAI1srgc0t6QzpZG61a94ZqIilXJ1H4tiTMhrwhu5CzmM91jDuGfhsQukyPE5A1TSFRVvke8F5n9_vahsi2FLQVd1WcTGXKRuly-znO3y2uL9kqKeLJYTJBmxY5pYTIqKLtN3vM_cBNmdYaBu-HMZwSR-UfuTodoQ6IqSvapNKdTpK49WAeLTwOtJL6PcUROfOUPx8rTbBybrzu2mZkGd6QESo-ctdMm5IGTQmMEOO8dedd7yj";

const navItems = [
  { to: "/", label: "Overview", icon: "dashboard" },
  { to: "/worklogs", label: "Work Logs", icon: "history_edu" },
  { to: "/modules", label: "Modules", icon: "view_module" },
  { to: "/assignments", label: "Assignments", icon: "assignment" },
  { to: "/submissions", label: "Submissions", icon: "send" },
  { to: "/announcements", label: "Announcements", icon: "campaign" },
  { to: "/profile", label: "Profile", icon: "account_circle" },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/worklogs": "Work Logs",
  "/modules": "Modules",
  "/assignments": "Assignments",
  "/submissions": "Submissions",
  "/announcements": "Announcements",
  "/profile": "Profile",
};

export function LmsLayout() {
  const { logout, userId, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const greeting = user?.name
    ? `Good Morning, ${user.name.split(" ")[0]}`
    : "Good Morning, Trainee";

  return (
    <DashboardLayout
      variant="lms"
      subtitle="Trainee Portal"
      items={navItems}
      headerTitle={pageTitles[location.pathname] ?? "Dashboard"}
      greeting={greeting}
      user={
        userId
          ? { name: user?.name ?? "Trainee", id: user?.unique_id ?? userId }
          : undefined
      }
      logo={<img src={LOGO_URL} alt="AltisOne" className="h-[50px] w-[150px] object-contain" />}
      onLogout={handleLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
