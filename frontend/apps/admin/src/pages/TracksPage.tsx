import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Input, Table, Badge, Modal, SkeletonTable } from "@itp/ui";

interface Track {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  module_count: number;
}

const schema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function TracksPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tracks, isLoading } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const { data } = await apiClient.get<Track[]>("/admin/tracks");
      return data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiClient.post("/admin/tracks", data),
    onSuccess: () => {
      toast.success("Track created");
      reset();
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/tracks/${id}`),
    onSuccess: () => {
      toast.success("Track deactivated");
      void queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Tracks</h1>
          <p className="text-sm text-slate-400">Manage internship tracks</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Track</Button>
      </div>

      {isLoading ? <SkeletonTable /> : (
        <Table
          columns={[
            { key: "name", header: "Name" },
            { key: "code", header: "Code" },
            { key: "module_count", header: "Modules" },
            {
              key: "is_active",
              header: "Status",
              render: (row) => <Badge variant={row.is_active ? "success" : "danger"}>{row.is_active ? "Active" : "Inactive"}</Badge>,
            },
            {
              key: "actions",
              header: "",
              render: (row) => row.is_active && (
                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(row.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              ),
            },
          ]}
          data={tracks ?? []}
          keyExtractor={(r) => r.id}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create Track"
        footer={<Button onClick={handleSubmit((d) => createMutation.mutate(d))} loading={createMutation.isPending}>Create</Button>}>
        <form className="space-y-4">
          <Input label="Name" {...register("name")} error={errors.name?.message} />
          <Input label="Code" {...register("code")} error={errors.code?.message} />
          <Input label="Description" {...register("description")} />
        </form>
      </Modal>
    </div>
  );
}
