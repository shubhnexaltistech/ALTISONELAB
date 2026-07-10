import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@itp/utils";
import type { TrackDetail } from "@itp/types";
import { SkeletonPage } from "@itp/ui";

export default function TrackPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["track", slug],
    queryFn: async () => {
      const { data: res } = await apiClient.get<TrackDetail>(`/public/tracks/${slug}`);
      return res;
    },
    enabled: Boolean(slug),
  });

  if (isLoading) return <SkeletonPage />;
  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fbff]">
        <p className="text-text-muted">Track not found.</p>
      </div>
    );
  }

  const fee = data.fee_inr ? `₹${data.fee_inr.toLocaleString()}` : "Contact us";

  return (
    <div className="geometric-bg min-h-screen">
      <nav className="border-b border-blue-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-bold text-[#1e40af]">
            AltisOneLabz
          </Link>
          <Link
            to={`/apply?track=${data.id}`}
            className="btn-landing-primary rounded-btn px-5 py-2.5 text-sm font-semibold text-white"
          >
            Enroll Now
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <div>
              <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase text-blue-600">
                {data.code}
              </span>
              <h1 className="brand-font mt-4 text-4xl font-bold text-[#1e293b]">{data.name}</h1>
              <p className="mt-3 text-lg text-text-muted">{data.description}</p>
              {data.duration && (
                <p className="mt-2 text-sm text-text-muted">
                  <i className="fas fa-clock mr-2 text-blue-500" />
                  {data.duration}
                </p>
              )}
            </div>

            {data.highlights && (
              <section className="rounded-[24px] border border-blue-100 bg-white p-8">
                <h2 className="brand-font mb-4 flex items-center gap-2 text-2xl font-bold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <i className="fas fa-star" />
                  </span>
                  Program Highlights
                </h2>
                <p className="whitespace-pre-line text-text-muted">{data.highlights}</p>
              </section>
            )}

            {data.outcomes && (
              <section className="rounded-[24px] border border-blue-100 bg-white p-8">
                <h2 className="brand-font mb-4 flex items-center gap-2 text-2xl font-bold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <i className="fas fa-bullseye" />
                  </span>
                  Learning Outcomes
                </h2>
                <p className="whitespace-pre-line text-text-muted">{data.outcomes}</p>
              </section>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-[24px] border border-blue-100 bg-white p-8 shadow-lg">
              <h3 className="brand-font text-xl font-bold">Enroll in this track</h3>
              <p className="mt-2 text-3xl font-bold text-blue-600">{fee}</p>
              <Link
                to={`/apply?track=${data.id}`}
                className="btn-landing-primary mt-6 block w-full rounded-btn py-3 text-center font-semibold text-white"
              >
                Start Application
              </Link>
              <p className="mt-4 text-center text-xs text-text-muted">
                Secure payment via Razorpay after application review
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
