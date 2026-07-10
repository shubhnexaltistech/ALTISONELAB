import { useApiQuery } from "@itp/hooks";
import { StatCard, SkeletonPage, MaterialIcon } from "@itp/ui";

interface DashboardData {
  mentor_name: string;
  assigned_trainees: number;
  pending_worklogs: number;
  pending_evaluations: number;
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useApiQuery<DashboardData>(["mentor-dashboard"], "/mentor/dashboard");

  if (isLoading) return <SkeletonPage />;
  if (isError || !data) return <p className="text-error">Failed to load dashboard.</p>;

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-h2 text-text-main">Welcome, {data.mentor_name}</h1>
        <p className="text-body-sm text-text-muted">Mentor dashboard overview</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Assigned Trainees"
          value={data.assigned_trainees}
          icon={<MaterialIcon name="groups" size={22} />}
          iconBg="bg-primary-light"
          iconColor="text-primary"
          className="border-l-4 border-l-primary"
        />
        <StatCard
          label="Pending Worklogs"
          value={data.pending_worklogs}
          icon={<MaterialIcon name="history_edu" size={22} />}
          iconBg="bg-[#fff7ed]"
          iconColor="text-[#ea580c]"
          className="border-l-4 border-l-[#ea580c]"
        />
        <StatCard
          label="Pending Evaluations"
          value={data.pending_evaluations}
          icon={<MaterialIcon name="rule" size={22} />}
          iconBg="bg-[#faf5ff]"
          iconColor="text-[#9333ea]"
          className="border-l-4 border-l-[#9333ea]"
        />
      </div>
    </div>
  );
}
