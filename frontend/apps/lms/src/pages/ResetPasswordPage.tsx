import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Input, Card, CardHeader } from "@itp/ui";

const schema = z.object({
  new_password: z.string().min(8, "Minimum 8 characters"),
  confirm: z.string(),
}).refine((d) => d.new_password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      apiClient.post("/auth/reset-password", { token, new_password: data.new_password }),
    onSuccess: () => {
      toast.success("Password reset successful");
      navigate("/login");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-600">Invalid reset link.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader title="Reset Password" description="Choose a new password." />
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input label="New Password" type="password" {...register("new_password")} error={errors.new_password?.message} />
          <Input label="Confirm Password" type="password" {...register("confirm")} error={errors.confirm?.message} />
          <Button type="submit" className="w-full" loading={mutation.isPending}>Reset Password</Button>
          <Link to="/login" className="block text-center text-sm text-brand-600 hover:underline">Back to login</Link>
        </form>
      </Card>
    </div>
  );
}
