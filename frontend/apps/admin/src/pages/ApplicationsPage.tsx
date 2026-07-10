import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Trash2 } from "lucide-react";
import { apiClient, getErrorMessage, formatDate } from "@itp/utils";
import { useDebounce } from "@itp/hooks";
import { Table, Badge, statusBadge, Button, SkeletonTable, Card } from "@itp/ui";

interface Application {
  id: string;
  applicant_name: string;
  email: string;
  phone: string;
  track_name: string;
  status: string;
  unique_id: string | null;
  created_at: string;
}

interface ApplicationsResponse {
  data: Application[];
  total: number;
  page: number;
  pages: number;
}

export default function ApplicationsPage() {
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const debouncedStatus = useDebounce(status, 300);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["applications", debouncedStatus, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (debouncedStatus) params.set("status", debouncedStatus);
      const { data: res } = await apiClient.get<ApplicationsResponse>(`/admin/applications?${params}`);
      return res;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/admin/applications/${id}/verify`),
    onSuccess: () => {
      toast.success("Application verified");
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/applications/${id}`),
    onSuccess: () => {
      toast.success("Application deleted");
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-sm text-slate-500">{data?.total ?? 0} total applications</p>
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="verified">Verified</option>
        </select>
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="p-4"><SkeletonTable /></div>
        ) : (
          <Table
            columns={[
              { key: "applicant_name", header: "Name" },
              { key: "email", header: "Email" },
              { key: "track_name", header: "Track" },
              {
                key: "status",
                header: "Status",
                render: (row) => <Badge variant={statusBadge(row.status)}>{row.status}</Badge>,
              },
              {
                key: "created_at",
                header: "Applied",
                render: (row) => formatDate(row.created_at),
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <div className="flex gap-2">
                    {row.status === "paid" && (
                      <Button size="sm" variant="outline" onClick={() => verifyMutation.mutate(row.id)} loading={verifyMutation.isPending}>
                        <Check className="h-3 w-3" /> Verify
                      </Button>
                    )}
                    {row.status !== "verified" && (
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(row.id)}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            data={data?.data ?? []}
            keyExtractor={(r) => r.id}
            emptyMessage="No applications found"
          />
        )}
      </Card>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-slate-600">Page {page} of {data.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
