import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Input, Table, Badge, Modal, SkeletonTable, ErrorState } from "@itp/ui";

interface Quiz {
  id: string;
  module_id: string;
  title: string;
  passing_score: number;
  question_count: number;
  is_active: boolean;
}

const schema = z.object({
  module_id: z.string().min(1),
  title: z.string().min(2),
  passing_score: z.coerce.number().min(1).max(100).default(70),
  question_text: z.string().min(5),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  correct_option: z.enum(["0", "1"]),
});

type FormData = z.infer<typeof schema>;

export default function QuizzesPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: quizzes, isLoading, isError, refetch } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data } = await apiClient.get<Quiz[]>("/admin/quizzes");
      return data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { passing_score: 70, correct_option: "0" },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      apiClient.post("/admin/quizzes", {
        module_id: data.module_id,
        title: data.title,
        passing_score: data.passing_score,
        questions: [{
          text: data.question_text,
          type: "mcq",
          points: 1,
          options: [
            { text: data.option_a, is_correct: data.correct_option === "0" },
            { text: data.option_b, is_correct: data.correct_option === "1" },
          ],
        }],
      }),
    onSuccess: () => {
      toast.success("Quiz created");
      reset();
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/quizzes/${id}`),
    onSuccess: () => {
      toast.success("Quiz deactivated");
      void queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Quizzes</h1>
          <p className="text-sm text-slate-400">Module quizzes and assessments</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create Quiz</Button>
      </div>

      {isLoading ? <SkeletonTable /> : (
        <Table
          columns={[
            { key: "title", header: "Title" },
            { key: "module_id", header: "Module ID" },
            { key: "question_count", header: "Questions" },
            { key: "passing_score", header: "Pass Score", render: (r) => `${r.passing_score}%` },
            {
              key: "is_active",
              header: "Status",
              render: (row) => <Badge variant={row.is_active ? "success" : "danger"}>{row.is_active ? "Active" : "Inactive"}</Badge>,
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
          data={quizzes ?? []}
          keyExtractor={(r) => r.id}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create Quiz"
        footer={<Button onClick={handleSubmit((d) => createMutation.mutate(d))} loading={createMutation.isPending}>Create</Button>}>
        <form className="space-y-4">
          <Input label="Module ID" {...register("module_id")} error={errors.module_id?.message} />
          <Input label="Quiz Title" {...register("title")} error={errors.title?.message} />
          <Input label="Passing Score %" type="number" {...register("passing_score")} />
          <Input label="Question" {...register("question_text")} error={errors.question_text?.message} />
          <Input label="Option A" {...register("option_a")} error={errors.option_a?.message} />
          <Input label="Option B" {...register("option_b")} error={errors.option_b?.message} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Correct Answer</label>
            <select {...register("correct_option")} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm">
              <option value="0">Option A</option>
              <option value="1">Option B</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
