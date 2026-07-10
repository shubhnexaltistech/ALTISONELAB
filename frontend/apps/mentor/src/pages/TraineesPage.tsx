import { useApiQuery } from "@itp/hooks";
import { Table, SkeletonTable } from "@itp/ui";

interface Trainee {
  id: string;
  name: string;
  unique_id: string;
  progress: { completed: number; total: number; percentage: number };
}

export default function TraineesPage() {
  const { data, isLoading } = useApiQuery<Trainee[]>(["mentor-trainees"], "/mentor/trainees");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trainees</h1>
        <p className="text-sm text-slate-500">Your assigned trainees and their progress</p>
      </div>

      {isLoading ? <SkeletonTable /> : (
        <Table
          columns={[
            { key: "name", header: "Name" },
            { key: "unique_id", header: "ID" },
            {
              key: "progress",
              header: "Progress",
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${row.progress.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600">
                    {row.progress.completed}/{row.progress.total} ({row.progress.percentage}%)
                  </span>
                </div>
              ),
            },
          ]}
          data={data ?? []}
          keyExtractor={(r) => r.id}
        />
      )}
    </div>
  );
}
