import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, getErrorMessage } from "@itp/utils";
import type { Assignment } from "@itp/types";
import {
  Button,
  Card,
  DataTable,
  Badge,
  StatCard,
  MaterialIcon,
  SkeletonTable,
  Input,
  Modal,
} from "@itp/ui";

interface AssignmentsResponse {
  data: Assignment[];
  stats: { upcoming: number; feedback: number; score_pct: number };
}

export default function AssignmentsPage() {
  const queryClient = useQueryClient();
  const [submitId, setSubmitId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [repoUrl, setRepoUrl] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["lms-assignments"],
    queryFn: async () => {
      const { data: res } = await apiClient.get<AssignmentsResponse>("/lms/assignments");
      return res;
    },
  });

  const submitMutation = useMutation({
    mutationFn: (payload: { assignment_id: string; content: string; repo_url: string }) =>
      apiClient.post("/lms/assignments/submissions", payload),
    onSuccess: () => {
      toast.success("Assignment submitted");
      setSubmitId(null);
      setContent("");
      setRepoUrl("");
      void queryClient.invalidateQueries({ queryKey: ["lms-assignments"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="fade-in space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2 text-text-main">Assignments</h1>
          <p className="text-body-sm text-text-muted">
            Manage your technical tasks and track your feedback loop.
          </p>
        </div>
        <Button variant="outline">
          <MaterialIcon name="filter_list" size={18} />
          Filter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Upcoming"
          value={String(data?.stats.upcoming ?? 0).padStart(2, "0")}
          subValue="pending this week"
          icon={<MaterialIcon name="pending_actions" size={22} />}
        />
        <StatCard
          label="Feedback"
          value={String(data?.stats.feedback ?? 0).padStart(2, "0")}
          subValue="reviews completed"
          icon={<MaterialIcon name="rate_review" size={22} />}
          iconBg="bg-[#fff7ed]"
          iconColor="text-[#ea580c]"
        />
        <StatCard
          label="Overall Score"
          value={`${data?.stats.score_pct ?? 0}%`}
          subValue="performance level"
          icon={<MaterialIcon name="stars" size={22} />}
          className="!border-none !bg-[#1e3a8a] !text-white [&_.stat-label]:!text-blue-200 [&_h3]:!text-white"
        />
      </div>

      <Card className="mb-0 overflow-hidden !p-0">
        <div className="border-b border-border px-6 pt-4">
          <span className="inline-block border-b-2 border-primary px-1 pb-3 text-sm font-semibold text-primary">
            Upcoming Assignments
          </span>
        </div>
        {isLoading ? (
          <SkeletonTable />
        ) : (
          <DataTable
            columns={[
              {
                key: "title",
                header: "Assignment Name",
                render: (row) => (
                  <div>
                    <p className="font-semibold">{row.title}</p>
                    <p className="text-xs text-text-muted">{row.description}</p>
                  </div>
                ),
              },
              {
                key: "module_title",
                header: "Module",
                render: (row) => (
                  <span className="rounded bg-primary-light px-2 py-1 text-[10px] font-bold uppercase text-primary">
                    {row.module_title ?? "—"}
                  </span>
                ),
              },
              { key: "due_date", header: "Due Date", render: (row) => row.due_date?.slice(0, 10) ?? "—" },
              {
                key: "status",
                header: "Status",
                render: (row) => <Badge variant={row.status === "submitted" ? "success" : "warning"}>{row.status}</Badge>,
              },
              {
                key: "mentor_feedback",
                header: "Mentor Feedback",
                render: (row) => (
                  <span className="text-text-muted italic">{row.mentor_feedback ?? "No feedback yet"}</span>
                ),
              },
              {
                key: "actions",
                header: "",
                render: (row) => (
                  <Button size="sm" variant="ghost" onClick={() => setSubmitId(row.id)}>
                    <MaterialIcon name="chevron_right" />
                  </Button>
                ),
              },
            ]}
            data={data?.data ?? []}
            keyExtractor={(r) => r.id}
            emptyMessage="No assignments yet"
          />
        )}
      </Card>

      <Modal open={Boolean(submitId)} onClose={() => setSubmitId(null)} title="Submit Assignment">
        <div className="space-y-4">
          <Input label="Notes" value={content} onChange={(e) => setContent(e.target.value)} />
          <Input label="Repository URL" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
          <Button
            loading={submitMutation.isPending}
            onClick={() =>
              submitId &&
              submitMutation.mutate({ assignment_id: submitId, content, repo_url: repoUrl })
            }
          >
            Submit
          </Button>
        </div>
      </Modal>
    </div>
  );
}
