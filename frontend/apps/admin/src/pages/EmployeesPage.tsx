import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, getErrorMessage } from "@itp/utils";
import type { Employee } from "@itp/types";
import { Button, Input, Card, DataTable, Badge, StatCard, SkeletonTable, Modal } from "@itp/ui";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  unique_id: z.string().min(1),
  track_id: z.string().min(1),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-employees"],
    queryFn: async () => {
      const { data: res } = await apiClient.get<{ data: Employee[]; total: number; active: number }>(
        "/admin/employees"
      );
      return res;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (body: FormData) => apiClient.post("/admin/employees", body),
    onSuccess: () => {
      toast.success("Employee added");
      setOpen(false);
      reset();
      void queryClient.invalidateQueries({ queryKey: ["admin-employees"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="fade-in space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-admin-text">Employee Directory</h2>
          <p className="text-sm text-slate-400">Unified management for your trainee workforce.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <i className="fas fa-user-plus mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <StatCard label="Total Employees" value={data?.total ?? 0} tone="dark" />
        <StatCard label="Active Now" value={data?.active ?? 0} tone="dark" />
      </div>

      <Card className="mb-0 overflow-hidden !border-white/10 !bg-admin-card !p-0">
        {isLoading ? (
          <SkeletonTable />
        ) : (
          <DataTable
            columns={[
              {
                key: "name",
                header: "Employee",
                render: (row) => (
                  <div>
                    <p className="font-semibold text-admin-text">{row.name}</p>
                    <p className="text-xs text-slate-400">{row.email}</p>
                  </div>
                ),
              },
              { key: "unique_id", header: "ID" },
              { key: "track_name", header: "Track" },
              {
                key: "progress_pct",
                header: "Progress",
                render: (row) => (
                  <span className="rounded-full border border-purple-300/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-300">
                    {row.progress_pct ?? 0}%
                  </span>
                ),
              },
              {
                key: "is_active",
                header: "Status",
                render: (row) => (
                  <Badge variant={row.is_active ? "success" : "default"}>
                    {row.is_active ? "Active" : "Inactive"}
                  </Badge>
                ),
              },
            ]}
            data={data?.data ?? []}
            keyExtractor={(r) => r.id}
            emptyMessage="No employees yet"
          />
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Employee">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <Input label="Name" {...register("name")} error={errors.name?.message} />
          <Input label="Email" {...register("email")} error={errors.email?.message} />
          <Input label="Unique ID" {...register("unique_id")} error={errors.unique_id?.message} />
          <Input label="Track ID" {...register("track_id")} error={errors.track_id?.message} />
          <Input label="Phone" {...register("phone")} />
          <Button type="submit" loading={createMutation.isPending} className="w-full">
            Create
          </Button>
        </form>
      </Modal>
    </div>
  );
}
