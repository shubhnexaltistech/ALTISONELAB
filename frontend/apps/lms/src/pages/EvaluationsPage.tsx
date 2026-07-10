import { useApiQuery } from "@itp/hooks";
import { Table, Badge, SkeletonTable, ErrorState } from "@itp/ui";

interface Evaluation {
  id: string;
  module_id: string;
  status: string;
  scores?: { code_quality: number; logic: number; execution: number; documentation: number };
  final_score?: number;
}

export default function EvaluationsPage() {
  const { data, isLoading, isError, refetch } = useApiQuery<Evaluation[]>(
    ["evaluations"],
    "/lms/evaluations"
  );

  if (isLoading) return <SkeletonTable />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Evaluations</h1>
        <p className="text-sm text-slate-500">Your module evaluation status and scores</p>
      </div>
      <Table
        columns={[
          { key: "module_id", header: "Module" },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Badge variant={r.status === "graded" ? "success" : r.status === "pending" ? "warning" : "default"}>
                {r.status}
              </Badge>
            ),
          },
          {
            key: "final_score",
            header: "Score",
            render: (r) => (r.final_score != null ? `${r.final_score}/100` : "—"),
          },
        ]}
        data={data ?? []}
        keyExtractor={(r) => r.id}
      />
    </div>
  );
}
