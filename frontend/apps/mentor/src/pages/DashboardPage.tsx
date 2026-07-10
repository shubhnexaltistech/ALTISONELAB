import { Users, ClipboardList, Star } from "lucide-react";
import { useApiQuery } from "@itp/hooks";
import { StatCard, SkeletonPage } from "@itp/ui";

interface DashboardData {
  mentor_name: string;
  assigned_trainees: number;
  pending_worklogs: number;
  pending_evaluations: number;
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useApiQuery<DashboardData>(["mentor-dashboard"], "/mentor/dashboard");

  if (isLoading) return <SkeletonPage />;
  if (isError || !data) return <p className="text-red-600">Failed to load dashboard.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {data.mentor_name}</h1>
        <p className="text-sm text-slate-500">Mentor dashboard overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned Trainees" value={data.assigned_trainees} icon={<Users className="h-6 w-6" />} />
        <StatCard label="Pending Worklogs" value={data.pending_worklogs} icon={<ClipboardList className="h-6 w-6" />} />
        <StatCard label="Pending Evaluations" value={data.pending_evaluations} icon={<Star className="h-6 w-6" />} />
      </div>
    </div>
  );
}
