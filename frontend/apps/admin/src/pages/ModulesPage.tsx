import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Input, Table, Modal, SkeletonTable, ErrorState } from "@itp/ui";

interface Module {
  id: string;
  track_id: string;
  title: string;
  order: number;
  description?: string;
  task_count: number;
}

interface Track {
  id: string;
  name: string;
}

const schema = z.object({
  track_id: z.string().min(1),
  title: z.string().min(2),
  order: z.coerce.number().min(1),
  description: z.string().optional(),
  task_title: z.string().min(2),
});

type FormData = z.infer<typeof schema>;

export default function ModulesPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: modules, isLoading, isError, refetch } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data } = await apiClient.get<Module[]>("/admin/modules");
      return data;
    },
  });

  const { data: tracks } = useQuery({
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
    mutationFn: (data: FormData) =>
      apiClient.post("/admin/modules", {
        track_id: data.track_id,
        title: data.title,
        order: data.order,
        description: data.description,
        tasks: [{ title: data.task_title, order: 1 }],
      }),
    onSuccess: () => {
      toast.success("Module created");
      reset();
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modules</h1>
          <p className="text-sm text-slate-500">Learning modules per track</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Module</Button>
      </div>

      {isLoading ? <SkeletonTable /> : (
        <Table
          columns={[
            { key: "title", header: "Title" },
            { key: "order", header: "Order" },
            { key: "track_id", header: "Track ID" },
            { key: "task_count", header: "Tasks" },
          ]}
          data={modules ?? []}
          keyExtractor={(r) => r.id}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create Module"
        footer={<Button onClick={handleSubmit((d) => createMutation.mutate(d))} loading={createMutation.isPending}>Create</Button>}>
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Track</label>
            <select {...register("track_id")} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm">
              <option value="">Select track</option>
              {tracks?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errors.track_id && <p className="mt-1 text-sm text-red-600">{errors.track_id.message}</p>}
          </div>
          <Input label="Title" {...register("title")} error={errors.title?.message} />
          <Input label="Order" type="number" {...register("order")} error={errors.order?.message} />
          <Input label="Description" {...register("description")} />
          <Input label="First Task Title" {...register("task_title")} error={errors.task_title?.message} />
        </form>
      </Modal>
    </div>
  );
}
