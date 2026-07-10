import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Input, Card, CardHeader, DataTable, Badge, statusBadge, SkeletonTable } from "@itp/ui";

const schema = z.object({
  date: z.string().min(1, "Date required"),
  content: z.string().min(10, "Describe your work (min 10 chars)"),
  hours_worked: z.coerce.number().min(0).max(24),
});

type FormData = z.infer<typeof schema>;

interface Worklog {
  id: string;
  date: string;
  content: string;
  hours_worked: number;
  status: string;
  mentor_note?: string;
}

export default function WorklogsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["worklogs"],
    queryFn: async () => {
      const { data: res } = await apiClient.get<{ data: Worklog[]; total: number }>("/lms/worklogs");
      return res;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { hours_worked: 8 },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiClient.post("/lms/worklogs", data),
    onSuccess: () => {
      toast.success("Worklog submitted");
      reset({ hours_worked: 8, date: "", content: "" });
      void queryClient.invalidateQueries({ queryKey: ["worklogs"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-h2 text-text-main">Work Logs</h1>
        <p className="text-body-sm text-text-muted">Log your daily work for mentor review</p>
      </div>

      <Card className="mb-0">
        <CardHeader title="Submit Worklog" />
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="grid gap-4 sm:grid-cols-2">
          <Input label="Date" type="date" {...register("date")} error={errors.date?.message} />
          <Input label="Hours Worked" type="number" step="0.5" {...register("hours_worked")} error={errors.hours_worked?.message} />
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-bold text-slate-600">What did you work on?</label>
            <textarea
              {...register("content")}
              rows={4}
              className="w-full rounded-lg border border-[#cbd5e1] px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.content && <p className="mt-1 text-sm text-error">{errors.content.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={createMutation.isPending}>Submit</Button>
          </div>
        </form>
      </Card>

      {isLoading ? (
        <SkeletonTable />
      ) : (
        <DataTable
          columns={[
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
              key: "mentor_note",
              header: "Mentor Note",
              render: (row) => row.mentor_note || "—",
            },
          ]}
          data={data?.data ?? []}
          keyExtractor={(r) => r.id}
          emptyMessage="No worklogs yet"
        />
      )}
    </div>
  );
}
