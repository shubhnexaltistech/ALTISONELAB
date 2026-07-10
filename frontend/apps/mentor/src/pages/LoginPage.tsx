import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@itp/hooks";
import { getErrorMessage } from "@itp/utils";
import { Button, Input, Card } from "@itp/ui";

const schema = z.object({
  identifier: z.string().min(1, "Employee ID or email required"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  if (isAuthenticated && role === "mentor") {
    navigate(from, { replace: true });
    return null;
  }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data);
      if (result.role !== "mentor") {
        await logout();
        toast.error("Access denied. Mentor credentials required.");
        return;
      }
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">A1</div>
          <h1 className="text-2xl font-bold text-slate-900">Mentor Login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in with your employee ID</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Employee ID or Email" {...register("identifier")} error={errors.identifier?.message} />
          <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
          <Button type="submit" className="w-full" loading={isSubmitting}>Sign In</Button>
          <a href="/forgot-password" className="block text-center text-sm text-brand-600 hover:underline">Forgot password?</a>
        </form>
      </Card>
    </div>
  );
}
