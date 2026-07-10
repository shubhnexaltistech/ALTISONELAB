import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Card, Table, Badge, statusBadge, Modal, SkeletonTable } from "@itp/ui";

interface Worklog {
  id: string;
  trainee_name: string;
  date: string;
  content: string;
  hours_worked: number;
  status: string;
}

export default function WorklogsPage() {
  const [selected, setSelected] = useState<Worklog | null>(null);
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["mentor-worklogs"],
    queryFn: async () => {
      const { data: res } = await apiClient.get<{ data: Worklog[] }>("/mentor/worklogs?status=pending");
      return res.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put(`/mentor/worklogs/${id}`, { status, mentor_note: note }),
    onSuccess: () => {
      toast.success("Worklog reviewed");
      setSelected(null);
      setNote("");
      void queryClient.invalidateQueries({ queryKey: ["mentor-worklogs"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Worklog Review</h1>
        <p className="text-sm text-slate-500">Review and approve trainee worklogs</p>
      </div>

      {isLoading ? <SkeletonTable /> : (
        <Table
          columns={[
            { key: "trainee_name", header: "Trainee" },
            { key: "date", header: "Date" },
            { key: "hours_worked", header: "Hours" },
            {
              key: "content",
              header: "Content",
              render: (row) => <span className="line-clamp-2 max-w-xs">{row.content}</span>,
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <Badge variant={statusBadge(row.status)}>{row.status}</Badge>,
            },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <Button size="sm" variant="outline" onClick={() => setSelected(row)}>Review</Button>
              ),
            },
          ]}
          data={data ?? []}
          keyExtractor={(r) => r.id}
          emptyMessage="No pending worklogs"
        />
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Review: ${selected?.trainee_name}`}
        footer={
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => reviewMutation.mutate({ id: selected!.id, status: "rejected" })} loading={reviewMutation.isPending}>
              <X className="h-4 w-4" /> Reject
            </Button>
            <Button onClick={() => reviewMutation.mutate({ id: selected!.id, status: "approved" })} loading={reviewMutation.isPending}>
              <Check className="h-4 w-4" /> Approve
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <Card padding={false} className="p-4">
              <p className="text-sm text-slate-500">Date: {selected.date} · {selected.hours_worked}h</p>
              <p className="mt-2 text-slate-700">{selected.content}</p>
            </Card>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mentor Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Optional feedback..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
