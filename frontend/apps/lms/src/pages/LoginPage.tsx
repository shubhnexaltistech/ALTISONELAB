import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@itp/hooks";
import { getErrorMessage } from "@itp/utils";
import { LoginScreen } from "@itp/ui";

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida/ADBb0uiOtVs5OOkDusuvshDBQS55FnGAI1srgc0t6QzpZG61a94ZqIilXJ1H4tiTMhrwhu5CzmM91jDuGfhsQukyPE5A1TSFRVvke8F5n9_vahsi2FLQVd1WcTGXKRuly-znO3y2uL9kqKeLJYTJBmxY5pYTIqKLtN3vM_cBNmdYaBu-HMZwSR-UfuTodoQ6IqSvapNKdTpK49WAeLTwOtJL6PcUROfOUPx8rTbBybrzu2mZkGd6QESo-ctdMm5IGTQmMEOO8dedd7yj";

export default function LoginPage() {
  const { login, logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && role === "trainee") {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (values: Record<string, string>) => {
    setError(undefined);
    setLoading(true);
    try {
      const result = await login({
        identifier: values.identifier,
        password: values.password,
      });
      if (result.role !== "trainee") {
        await logout();
        setError("Access denied. Trainee credentials required.");
        return;
      }
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginScreen
      variant="lms"
      title="Trainee Portal Login"
      logo={<img src={LOGO_URL} alt="AltisOne" className="mx-auto h-[50px] w-[150px] object-contain" />}
      fields={[
        {
          name: "identifier",
          label: "Trainee ID",
          placeholder: "e.g. A1M22601001",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Your password",
        },
      ]}
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
      footer={
        <a href="/forgot-password" className="mt-4 block text-center text-sm text-primary hover:underline">
          Forgot password?
        </a>
      }
    />
  );
}
