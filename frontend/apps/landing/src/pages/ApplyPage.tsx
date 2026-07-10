import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { Button, Input, Card, CardHeader, Skeleton } from "@itp/ui";
import { API_V1, getErrorMessage } from "@itp/utils";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  college: z.string().optional(),
  city: z.string().optional(),
  track_id: z.string().min(1, "Please select a track"),
});

type FormData = z.infer<typeof schema>;

interface Track {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export default function ApplyPage() {
  const navigate = useNavigate();
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const { data } = await axios.get<Track[]>(`${API_V1}/public/tracks`);
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: res } = await axios.post<{ id: string; message: string }>(`${API_V1}/public/apply`, data);
      return res;
    },
    onSuccess: (res: { id: string }) => {
      toast.success("Application submitted! Proceed to payment.");
      navigate(`/payment/${res.id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
          <Link to="/" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">Apply to AltisOne ITP</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader
            title="Application Form"
            description="Fill in your details to apply for the internship program."
          />
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <Input label="Full Name" {...register("name")} error={errors.name?.message} />
            <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
            <Input label="Phone" type="tel" {...register("phone")} error={errors.phone?.message} />
            <Input label="College" {...register("college")} />
            <Input label="City" {...register("city")} />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Track</label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : !tracks?.length ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  No tracks are available yet. Please check back later or contact support.
                </p>
              ) : (
                <select
                  {...register("track_id")}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a track</option>
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              )}
              {errors.track_id && <p className="mt-1 text-sm text-red-600">{errors.track_id.message}</p>}
            </div>

            <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!tracks?.length}>
              Submit Application
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
