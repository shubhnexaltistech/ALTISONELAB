import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { apiClient, getErrorMessage, formatDuration } from "@itp/utils";
import { Button, Card, CardHeader, SkeletonPage } from "@itp/ui";

interface QuizQuestion {
  id: string;
  text: string;
  type: string;
  options: { text: string }[];
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  time_limit_mins: number;
  passing_score: number;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data } = await apiClient.get<Quiz>(`/lms/quizzes/${quizId}`);
      return data;
    },
    enabled: !!quizId,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ attempt_id: string }>(`/lms/quizzes/${quizId}/start`);
      return data;
    },
    onSuccess: (data) => {
      setAttemptId(data.attempt_id);
      setStarted(true);
      if (quiz) setTimeLeft(quiz.time_limit_mins * 60);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        attempt_id: attemptId!,
        answers: Object.entries(answers).map(([question_id, selected_options]) => ({
          question_id,
          selected_options,
        })),
      };
      const { data } = await apiClient.post(`/lms/quizzes/${quizId}/submit`, payload);
      return data;
    },
    onSuccess: (data: { passed: boolean; score: number }) => {
      if (data.passed) {
        toast.success(`Quiz passed! Score: ${data.score}%`);
      } else {
        toast.error(`Quiz failed. Score: ${data.score}%`);
      }
      navigate("/modules");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = useCallback(() => {
    if (!attemptId || submitMutation.isPending) return;
    submitMutation.mutate();
  }, [attemptId, submitMutation]);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, handleSubmit]);

  const toggleOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const exists = current.includes(optionIndex);
      return {
        ...prev,
        [questionId]: exists
          ? current.filter((i) => i !== optionIndex)
          : [...current, optionIndex],
      };
    });
  };

  if (isLoading) return <SkeletonPage />;
  if (!quiz) return <p className="text-red-600">Quiz not found.</p>;

  if (!started) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader title={quiz.title} description={`Passing score: ${quiz.passing_score}%`} />
          <div className="space-y-2 text-sm text-slate-600">
            <p>{quiz.questions.length} questions</p>
            <p>Time limit: {quiz.time_limit_mins} minutes</p>
          </div>
          <Button className="mt-6 w-full" onClick={() => startMutation.mutate()} loading={startMutation.isPending}>
            Start Quiz
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
        <div className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold ${timeLeft < 60 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
          <Clock className="h-5 w-5" />
          {formatDuration(timeLeft)}
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, qi) => (
          <Card key={q.id}>
            <p className="mb-4 font-medium text-slate-900">
              {qi + 1}. {q.text}
              <span className="ml-2 text-sm text-slate-400">({q.points} pts)</span>
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id]?.includes(oi);
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      selected ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleOption(q.id, oi)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600"
                    />
                    <span className="text-sm text-slate-700">{opt.text}</span>
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <Button className="w-full" size="lg" onClick={handleSubmit} loading={submitMutation.isPending}>
        Submit Quiz
      </Button>
    </div>
  );
}
