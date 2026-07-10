import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Input, Table, Badge, Modal, SkeletonTable, ErrorState } from "@itp/ui";

interface Announcement {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
}

const schema = z.object({
  title: z.string().min(2),
  body: z.string().min(5),
});

type FormData = z.infer<typeof schema>;

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data } = await apiClient.get<Announcement[]>("/admin/announcements");
      return data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (body: FormData) => apiClient.post("/admin/announcements", { ...body, target_tracks: [] }),
    onSuccess: () => {
      toast.success("Announcement created");
      reset();
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/announcements/${id}`),
    onSuccess: () => {
      toast.success("Announcement deactivated");
      void queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-sm text-slate-500">Broadcast updates to trainees</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New</Button>
      </div>

      {isLoading ? <SkeletonTable /> : (
        <Table
          columns={[
            { key: "title", header: "Title" },
            { key: "body", header: "Body", render: (r) => r.body.slice(0, 80) + (r.body.length > 80 ? "…" : "") },
            {
              key: "is_active",
              header: "Status",
              render: (r) => <Badge variant={r.is_active ? "success" : "danger"}>{r.is_active ? "Active" : "Inactive"}</Badge>,
            },
            {
              key: "actions",
              header: "",
              render: (r) => r.is_active ? (
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(r.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              ) : null,
            },
          ]}
          data={data ?? []}
          keyExtractor={(r) => r.id}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Announcement"
        footer={<Button onClick={handleSubmit((d) => createMutation.mutate(d))} loading={createMutation.isPending}>Publish</Button>}>
        <form className="space-y-4">
          <Input label="Title" {...register("title")} error={errors.title?.message} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Body</label>
            <textarea {...register("body")} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>}
          </div>
        </form>
      </Modal>
    </div>
  );
}
