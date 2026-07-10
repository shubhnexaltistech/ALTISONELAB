import { useApiQuery } from "@itp/hooks";
import { Card, CardHeader, StatCard, SkeletonPage, Badge, statusBadge } from "@itp/ui";

interface DashboardData {
  user: { name: string; unique_id: string };
  progress: { total_modules: number; completed: number; unlocked: number; percentage: number };
  recent_worklogs: { id: string; date: string; status: string }[];
  announcements: { id: string; title: string; body: string }[];
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useApiQuery<DashboardData>(["lms-dashboard"], "/lms/dashboard");

  if (isLoading) return <SkeletonPage />;
  if (isError || !data) return <p className="text-red-600">Failed to load dashboard.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {data.user.name}</h1>
        <p className="text-sm text-slate-500">ID: {data.user.unique_id}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Progress" value={`${data.progress.percentage}%`} />
        <StatCard label="Modules Completed" value={`${data.progress.completed}/${data.progress.total_modules}`} />
        <StatCard label="Unlocked" value={data.progress.unlocked} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Worklogs" />
          {data.recent_worklogs.length === 0 ? (
            <p className="text-sm text-slate-500">No worklogs yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.recent_worklogs.map((w) => (
                <li key={w.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">{w.date}</span>
                  <Badge variant={statusBadge(w.status)}>{w.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Announcements" />
          {data.announcements.length === 0 ? (
            <p className="text-sm text-slate-500">No announcements.</p>
          ) : (
            <ul className="space-y-4">
              {data.announcements.map((a) => (
                <li key={a.id}>
                  <h4 className="font-medium text-slate-900">{a.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
