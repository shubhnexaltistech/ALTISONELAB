import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_V1 } from "@itp/utils";
import { Badge, Card, CardHeader, SkeletonPage, ErrorState, Button } from "@itp/ui";

interface Status {
  id: string;
  applicant_name: string;
  email: string;
  track_name: string;
  status: "pending" | "paid" | "verified";
  unique_id?: string;
}

export default function ApplicationStatusPage() {
  const { applicationId } = useParams<{ applicationId: string }>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["application-status", applicationId],
    queryFn: async () => {
      const { data } = await axios.get<Status>(
        `${API_V1}/public/applications/${applicationId}/status`
      );
      return data;
    },
    enabled: !!applicationId,
    refetchInterval: (q) => (q.state.data?.status === "pending" ? 5000 : false),
  });

  if (!applicationId) return <p className="p-8 text-red-600">Invalid application.</p>;
  if (isLoading) return <div className="p-8"><SkeletonPage /></div>;
  if (isError || !data) return <div className="p-8"><ErrorState onRetry={() => void refetch()} /></div>;

  const statusVariant =
    data.status === "verified" ? "success" : data.status === "paid" ? "warning" : "default";

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader title="Application Status" description={`Track: ${data.track_name}`} />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Name</dt><dd className="font-medium">{data.applicant_name}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="font-medium">{data.email}</dd></div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">Status</dt>
              <dd><Badge variant={statusVariant}>{data.status}</Badge></dd>
            </div>
            {data.unique_id && (
              <div className="flex justify-between"><dt className="text-slate-500">Trainee ID</dt><dd className="font-mono font-medium">{data.unique_id}</dd></div>
            )}
          </dl>
          {data.status === "pending" && (
            <Link to={`/payment/${applicationId}`} className="mt-6 block">
              <Button className="w-full">Proceed to Payment</Button>
            </Link>
          )}
          {data.status === "verified" && data.unique_id && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              You are verified! Login to the trainee portal with ID <strong>{data.unique_id}</strong>.
            </p>
          )}
          <Link to="/" className="mt-4 block text-center text-sm text-brand-600 hover:underline">Back to home</Link>
        </Card>
      </div>
    </div>
  );
}
