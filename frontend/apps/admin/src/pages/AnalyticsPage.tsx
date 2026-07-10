import { useApiQuery } from "@itp/hooks";
import { Card, CardHeader, SkeletonPage } from "@itp/ui";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface AnalyticsData {
  tracks: { track_name: string; trainees: number; applications: number }[];
  quizzes: { total_attempts: number; passed: number; pass_rate: number };
  worklogs: { total: number; approved: number };
  evaluations: { graded: number };
}

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"];

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useApiQuery<AnalyticsData>(["analytics"], "/admin/analytics");

  if (isLoading) return <SkeletonPage />;
  if (isError || !data) return <p className="text-red-600">Failed to load analytics.</p>;

  const quizData = [
    { name: "Passed", value: data.quizzes.passed },
    { name: "Failed", value: data.quizzes.total_attempts - data.quizzes.passed },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Analytics</h1>
        <p className="text-sm text-slate-400">Program performance insights</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader title="Quiz Pass Rate" />
          <p className="text-3xl font-bold text-brand-600">{data.quizzes.pass_rate}%</p>
          <p className="text-sm text-slate-400">{data.quizzes.total_attempts} total attempts</p>
        </Card>
        <Card>
          <CardHeader title="Worklogs" />
          <p className="text-3xl font-bold text-emerald-600">{data.worklogs.approved}</p>
          <p className="text-sm text-slate-400">of {data.worklogs.total} approved</p>
        </Card>
        <Card>
          <CardHeader title="Evaluations" />
          <p className="text-3xl font-bold text-violet-600">{data.evaluations.graded}</p>
          <p className="text-sm text-slate-400">graded evaluations</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Trainees by Track" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.tracks}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="track_name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ background: "#161A26", border: "1px solid rgba(255,255,255,0.1)", color: "#F1F5F9" }}
              />
              <Bar dataKey="trainees" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Quiz Results" />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={quizData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {quizData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: "#cbd5e1" }} />
              <Tooltip
                contentStyle={{ background: "#161A26", border: "1px solid rgba(255,255,255,0.1)", color: "#F1F5F9" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
