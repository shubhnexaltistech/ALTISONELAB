import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Input, Card, CardHeader, SkeletonPage } from "@itp/ui";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  github_url: z.string().url().optional().or(z.literal("")),
});

const passwordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(6),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

interface Profile {
  id: string;
  unique_id: string;
  email: string;
  profile: { name: string; phone?: string; github_url?: string };
}

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await apiClient.get<Profile>("/lms/profile");
      return data;
    },
  });

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) => apiClient.put("/lms/profile", data),
    onSuccess: () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordForm) => apiClient.put("/lms/profile/password", data),
    onSuccess: () => {
      toast.success("Password changed");
      passwordForm.reset();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <SkeletonPage />;
  if (!profile) return <p className="text-red-600">Failed to load profile.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">ID: {profile.unique_id} · {profile.email}</p>
      </div>

      <Card>
        <CardHeader title="Personal Information" />
        <form onSubmit={profileForm.handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
          <Input label="Name" defaultValue={profile.profile.name} {...profileForm.register("name")} />
          <Input label="Phone" defaultValue={profile.profile.phone} {...profileForm.register("phone")} />
          <Input label="GitHub URL" defaultValue={profile.profile.github_url} {...profileForm.register("github_url")} />
          <Button type="submit" loading={updateMutation.isPending}>Save Changes</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Change Password" />
        <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4">
          <Input label="Current Password" type="password" {...passwordForm.register("current_password")} error={passwordForm.formState.errors.current_password?.message} />
          <Input label="New Password" type="password" {...passwordForm.register("new_password")} error={passwordForm.formState.errors.new_password?.message} />
          <Button type="submit" loading={passwordMutation.isPending}>Change Password</Button>
        </form>
      </Card>
    </div>
  );
}
