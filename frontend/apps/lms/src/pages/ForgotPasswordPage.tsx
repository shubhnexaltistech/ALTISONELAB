import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Input, Card, CardHeader } from "@itp/ui";

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiClient.post("/auth/forgot-password", data),
    onSuccess: () => toast.success("If the email exists, a reset link has been sent."),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader title="Forgot Password" description="Enter your email to receive a reset link." />
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Button type="submit" className="w-full" loading={mutation.isPending}>Send Reset Link</Button>
          <Link to="/login" className="block text-center text-sm text-brand-600 hover:underline">Back to login</Link>
        </form>
      </Card>
    </div>
  );
}
