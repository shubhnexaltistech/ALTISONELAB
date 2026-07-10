import { useApiQuery } from "@itp/hooks";
import { StatCard, SkeletonPage } from "@itp/ui";

interface DashboardData {
  applications: { total: number; pending: number; paid: number; verified: number };
  users: { trainees: number; mentors: number };
  revenue: { total: number; currency: string };
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useApiQuery<DashboardData>(["admin-dashboard"], "/admin/dashboard");

  if (isLoading) return <SkeletonPage />;
  if (isError || !data) return <p className="text-red-400">Failed to load dashboard.</p>;

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Dashboard</h1>
        <p className="text-sm text-slate-400">Overview of your internship program</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={data.applications.total}
          icon={<i className="fas fa-file-lines text-xl" />}
          tone="dark"
        />
        <StatCard
          label="Pending Review"
          value={data.applications.pending}
          icon={<i className="fas fa-clock text-xl" />}
          tone="dark"
        />
        <StatCard
          label="Active Trainees"
          value={data.users.trainees}
          icon={<i className="fas fa-users text-xl" />}
          tone="dark"
        />
        <StatCard
          label="Revenue"
          value={`₹${data.revenue.total.toLocaleString()}`}
          icon={<i className="fas fa-indian-rupee-sign text-xl" />}
          tone="dark"
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard label="Paid Applications" value={data.applications.paid} tone="dark" />
        <StatCard label="Verified" value={data.applications.verified} tone="dark" />
        <StatCard label="Mentors" value={data.users.mentors} tone="dark" />
      </div>
    </div>
  );
}
