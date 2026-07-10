import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@itp/utils";
import type { Submission } from "@itp/types";
import { Card, DataTable, Badge, statusBadge, SkeletonTable } from "@itp/ui";

export default function SubmissionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["lms-submissions"],
    queryFn: async () => {
      const { data: res } = await apiClient.get<{ data: Submission[]; total: number }>(
        "/lms/assignments/submissions"
      );
      return res;
    },
  });

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-h2 text-text-main">Submissions</h1>
        <p className="text-body-sm text-text-muted">View your past assignment submissions and mentor feedback.</p>
      </div>

      <Card className="mb-0 overflow-hidden !p-0">
        {isLoading ? (
          <SkeletonTable />
        ) : (
          <DataTable
            columns={[
              {
                key: "assignment_title",
                header: "Assignment",
                render: (row) => <span className="font-semibold">{row.assignment_title ?? "—"}</span>,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <Badge variant={statusBadge(row.status)}>{row.status}</Badge>,
              },
              { key: "submitted_at", header: "Submitted", render: (row) => row.submitted_at?.slice(0, 10) ?? "—" },
              {
                key: "mentor_feedback",
                header: "Feedback",
                render: (row) => row.mentor_feedback ?? "—",
              },
              {
                key: "repo_url",
                header: "Repository",
                render: (row) =>
                  row.repo_url ? (
                    <a href={row.repo_url} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "—"
                  ),
              },
            ]}
            data={data?.data ?? []}
            keyExtractor={(r) => r.id}
            emptyMessage="No submissions yet"
          />
        )}
      </Card>
    </div>
  );
}
