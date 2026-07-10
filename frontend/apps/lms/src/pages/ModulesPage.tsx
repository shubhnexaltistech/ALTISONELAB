import { Link } from "react-router-dom";
import { Lock, Unlock, CheckCircle } from "lucide-react";
import { useApiQuery } from "@itp/hooks";
import { Card, Badge, Skeleton, SkeletonCard } from "@itp/ui";

interface Module {
  id: string;
  title: string;
  order: number;
  description?: string;
  quiz_id?: string;
  is_unlocked: boolean;
  quiz_passed: boolean;
}

export default function ModulesPage() {
  const { data: modules, isLoading } = useApiQuery<Module[]>(["modules"], "/lms/modules");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Modules</h1>
        <p className="text-sm text-slate-500">Complete modules in order to unlock the next</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules?.map((mod) => (
          <Card
            key={mod.id}
            className={`relative transition-shadow ${mod.is_unlocked ? "hover:shadow-md" : "opacity-60"}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Module {mod.order}</span>
              {mod.quiz_passed ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : mod.is_unlocked ? (
                <Unlock className="h-5 w-5 text-brand-500" />
              ) : (
                <Lock className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <h3 className="font-semibold text-slate-900">{mod.title}</h3>
            {mod.description && <p className="mt-1 text-sm text-slate-500 line-clamp-2">{mod.description}</p>}
            <div className="mt-4 flex items-center gap-2">
              {mod.quiz_passed && <Badge variant="success">Completed</Badge>}
              {!mod.is_unlocked && <Badge variant="default">Locked</Badge>}
              {mod.is_unlocked && !mod.quiz_passed && <Badge variant="info">In Progress</Badge>}
            </div>
            {mod.is_unlocked && (
              <Link
                to={`/modules/${mod.id}`}
                className="mt-4 block text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View module →
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
