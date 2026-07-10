import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Card, Badge, statusBadge, Modal, Skeleton } from "@itp/ui";

interface Evaluation {
  id: string;
  trainee_name: string;
  module_id: string;
  status: string;
  github_url?: string;
  final_score?: number;
}

interface Scores {
  code_quality: number;
  logic: number;
  execution: number;
  documentation: number;
}

const SCORE_LABELS: { key: keyof Scores; label: string }[] = [
  { key: "code_quality", label: "Code Quality" },
  { key: "logic", label: "Logic" },
  { key: "execution", label: "Execution" },
  { key: "documentation", label: "Documentation" },
];

export default function EvaluationsPage() {
  const [selected, setSelected] = useState<Evaluation | null>(null);
  const [scores, setScores] = useState<Scores>({ code_quality: 5, logic: 5, execution: 5, documentation: 5 });
  const [feedback, setFeedback] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["mentor-evaluations"],
    queryFn: async () => {
      const { data: res } = await apiClient.get<Evaluation[]>("/mentor/evaluations");
      return res;
    },
  });

  const draftMutation = useMutation({
    mutationFn: () =>
      apiClient.put(`/mentor/evaluations/${selected!.id}/draft`, { scores, feedback }),
    onSuccess: () => toast.success("Draft saved"),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put(`/mentor/evaluations/${selected!.id}/draft`, { scores, feedback });
      const { data } = await apiClient.put(`/mentor/evaluations/${selected!.id}/submit`);
      return data;
    },
    onSuccess: (data: { final_score: number }) => {
      toast.success(`Evaluation submitted. Final score: ${data.final_score}`);
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ["mentor-evaluations"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateScore = (key: keyof Scores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Evaluations</h1>
        <p className="text-sm text-slate-500">Grade trainee project submissions</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((ev) => (
            <Card key={ev.id}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{ev.trainee_name}</h3>
                <Badge variant={statusBadge(ev.status)}>{ev.status}</Badge>
              </div>
              <p className="text-sm text-slate-500">Module: {ev.module_id}</p>
              {ev.final_score != null && (
                <p className="mt-1 text-sm font-medium text-brand-600">Score: {ev.final_score}</p>
              )}
              {ev.github_url && (
                <a href={ev.github_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
                  <ExternalLink className="h-3 w-3" /> GitHub
                </a>
              )}
              {ev.status !== "graded" && (
                <Button size="sm" className="mt-4 w-full" variant="outline" onClick={() => setSelected(ev)}>
                  Evaluate
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Evaluate: ${selected?.trainee_name}`}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => draftMutation.mutate()} loading={draftMutation.isPending}>Save Draft</Button>
            <Button onClick={() => submitMutation.mutate()} loading={submitMutation.isPending}>Submit Evaluation</Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-6">
            {selected.github_url && (
              <a href={selected.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline">
                <ExternalLink className="h-4 w-4" /> View GitHub Submission
              </a>
            )}

            <div className="space-y-5">
              {SCORE_LABELS.map(({ key, label }) => (
                <div key={key}>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">{label}</label>
                    <span className="text-sm font-bold text-brand-600">{scores[key]}/10</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={scores[key]}
                    onChange={(e) => updateScore(key, parseFloat(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-brand-600"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Provide constructive feedback..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
