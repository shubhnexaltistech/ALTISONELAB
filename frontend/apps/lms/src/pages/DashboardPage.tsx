import { useApiQuery } from "@itp/hooks";
import { Card, CardHeader, StatCard, SkeletonPage, Badge, statusBadge, MaterialIcon, Button } from "@itp/ui";

interface DashboardData {
  user: { name: string; unique_id: string };
  progress: { total_modules: number; completed: number; unlocked: number; percentage: number };
  recent_worklogs: { id: string; date: string; status: string }[];
  announcements: { id: string; title: string; body: string }[];
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useApiQuery<DashboardData>(["lms-dashboard"], "/lms/dashboard");

  if (isLoading) return <SkeletonPage />;
  if (isError || !data) return <p className="text-error">Failed to load dashboard.</p>;

  return (
    <div className="fade-in space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 text-text-main">Dashboard Overview</h1>
          <p className="mt-1 text-body-sm text-text-muted">
            Track your learning progress and daily activities
          </p>
        </div>
        <Button>
          <MaterialIcon name="play_arrow" size={18} />
          Start Session
        </Button>
      </div>

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
      >
        <StatCard
          label="Modules Completed"
          value={`${data.progress.completed}/${data.progress.total_modules}`}
          icon={<MaterialIcon name="view_module" size={22} />}
          iconBg="bg-primary-light"
          iconColor="text-primary"
          badge={
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[#059669] bg-[#ecfdf5]">
              +{data.progress.percentage}%
            </span>
          }
        />
        <StatCard
          label="Unlocked Modules"
          value={data.progress.unlocked}
          icon={<MaterialIcon name="assignment" size={22} />}
          iconBg="bg-[#fff7ed]"
          iconColor="text-[#ea580c]"
        />
        <StatCard
          label="Overall Progress"
          value={`${data.progress.percentage}%`}
          icon={<MaterialIcon name="trending_up" size={22} />}
          iconBg="bg-[#faf5ff]"
          iconColor="text-[#9333ea]"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="mb-0">
          <CardHeader title="Recent Worklogs" />
          {data.recent_worklogs.length === 0 ? (
            <p className="text-body-sm text-text-muted">No worklogs yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.recent_worklogs.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between rounded-lg bg-bg-main px-4 py-3"
                >
                  <span className="text-body-sm text-text-main">{w.date}</span>
                  <Badge variant={statusBadge(w.status)}>{w.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="mb-0">
          <CardHeader title="Announcements" />
          {data.announcements.length === 0 ? (
            <p className="text-body-sm text-text-muted">No announcements.</p>
          ) : (
            <ul className="space-y-4">
              {data.announcements.map((a) => (
                <li key={a.id}>
                  <h4 className="font-semibold text-text-main">{a.title}</h4>
                  <p className="mt-1 text-body-sm text-text-muted">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
