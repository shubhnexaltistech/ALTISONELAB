import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useApiQuery } from "@itp/hooks";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Card, CardHeader, Button, SkeletonPage, Input, ErrorState } from "@itp/ui";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface ModuleDetail {
  id: string;
  title: string;
  order: number;
  description?: string;
  tasks: { title: string; description?: string; order: number }[];
  quiz_id?: string;
}

const githubSchema = z.object({
  github_url: z.string().url("Valid GitHub URL required"),
});

type GithubForm = z.infer<typeof githubSchema>;

export default function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [showGithub, setShowGithub] = useState(false);
  const queryClient = useQueryClient();

  const { data: module, isLoading, isError, refetch } = useApiQuery<ModuleDetail>(
    ["module", moduleId],
    `/lms/modules/${moduleId}`,
    undefined,
    { enabled: !!moduleId }
  );

  const { register, handleSubmit, formState: { errors } } = useForm<GithubForm>({
    resolver: zodResolver(githubSchema),
  });

  const submitGithub = useMutation({
    mutationFn: (data: GithubForm) =>
      apiClient.post("/lms/profile/submit-github", { module_id: moduleId, github_url: data.github_url }),
    onSuccess: () => {
      toast.success("Submitted for mentor review");
      setShowGithub(false);
      void queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <SkeletonPage />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!module) return <p className="text-red-600">Module not found.</p>;

  return (
    <div className="space-y-6">
      <Link to="/modules" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to modules
      </Link>

      <Card>
        <CardHeader title={`Module ${module.order}: ${module.title}`} description={module.description} />
        {module.tasks.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Tasks</h3>
            {module.tasks.map((task, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4">
                <h4 className="font-medium text-slate-800">{task.title}</h4>
                {task.description && <p className="mt-1 text-sm text-slate-600">{task.description}</p>}
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          {module.quiz_id && (
            <Link to={`/quiz/${module.quiz_id}`}>
              <Button>Take Quiz <ExternalLink className="h-4 w-4" /></Button>
            </Link>
          )}
          <Button variant="outline" onClick={() => setShowGithub(!showGithub)}>
            Submit GitHub
          </Button>
        </div>
        {showGithub && (
          <form onSubmit={handleSubmit((d) => submitGithub.mutate(d))} className="mt-4 space-y-3 rounded-lg border border-slate-200 p-4">
            <Input label="GitHub Repository URL" {...register("github_url")} error={errors.github_url?.message} />
            <Button type="submit" loading={submitGithub.isPending}>Submit for Review</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
