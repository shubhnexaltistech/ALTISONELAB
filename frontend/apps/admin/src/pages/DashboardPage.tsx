import { Users, FileText, IndianRupee, CheckCircle } from "lucide-react";
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
  if (isError || !data) return <p className="text-red-600">Failed to load dashboard.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your internship program</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Applications" value={data.applications.total} icon={<FileText className="h-6 w-6" />} />
        <StatCard label="Pending Review" value={data.applications.pending} icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard label="Active Trainees" value={data.users.trainees} icon={<Users className="h-6 w-6" />} />
        <StatCard label="Revenue" value={`₹${data.revenue.total.toLocaleString()}`} icon={<IndianRupee className="h-6 w-6" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Paid Applications" value={data.applications.paid} />
        <StatCard label="Verified" value={data.applications.verified} />
        <StatCard label="Mentors" value={data.users.mentors} />
      </div>
    </div>
  );
}
