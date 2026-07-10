import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@itp/utils";
import type { Announcement } from "@itp/types";
import { Card, SkeletonPage } from "@itp/ui";

export default function AnnouncementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["lms-announcements"],
    queryFn: async () => {
      const { data: res } = await apiClient.get<Announcement[]>("/lms/announcements");
      return res;
    },
  });

  if (isLoading) return <SkeletonPage />;

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-h2 text-text-main">Announcements</h1>
        <p className="text-body-sm text-text-muted">Stay updated with program news and deadlines.</p>
      </div>

      <div className="space-y-4">
        {(data ?? []).length === 0 ? (
          <Card className="mb-0 text-text-muted">No announcements yet.</Card>
        ) : (
          data?.map((a) => (
            <Card key={a.id} className="mb-0">
              <h3 className="text-lg font-semibold text-text-main">{a.title}</h3>
              <p className="mt-2 text-body-sm text-text-muted">{a.body}</p>
              {a.created_at && (
                <p className="mt-3 text-xs text-text-light">{new Date(a.created_at).toLocaleDateString()}</p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
