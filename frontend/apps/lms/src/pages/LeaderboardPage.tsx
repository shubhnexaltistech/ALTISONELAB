import { Trophy } from "lucide-react";
import { useApiQuery } from "@itp/hooks";
import { useAuth } from "@itp/hooks";
import { Table, SkeletonTable } from "@itp/ui";

interface LeaderboardEntry {
  user_id: string;
  name: string;
  modules_completed: number;
  avg_eval_score: number;
  composite_score: number;
  rank: number;
}

export default function LeaderboardPage() {
  const { userId } = useAuth();
  const { data, isLoading } = useApiQuery<LeaderboardEntry[]>(["leaderboard"], "/lms/leaderboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-sm text-slate-500">See how you rank among your peers</p>
      </div>

      {isLoading ? <SkeletonTable rows={10} /> : (
        <Table
          columns={[
            {
              key: "rank",
              header: "Rank",
              render: (row) => (
                <span className={`flex items-center gap-1 font-bold ${row.rank <= 3 ? "text-amber-600" : ""}`}>
                  {row.rank <= 3 && <Trophy className="h-4 w-4" />}
                  #{row.rank}
                </span>
              ),
            },
            {
              key: "name",
              header: "Name",
              render: (row) => (
                <span className={row.user_id === userId ? "font-semibold text-brand-600" : ""}>
                  {row.name} {row.user_id === userId && "(You)"}
                </span>
              ),
            },
            { key: "modules_completed", header: "Modules" },
            { key: "avg_eval_score", header: "Avg Score" },
            { key: "composite_score", header: "Total Score" },
          ]}
          data={data ?? []}
          keyExtractor={(r) => r.user_id}
        />
      )}
    </div>
  );
}
