import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@itp/hooks";
import { getErrorMessage } from "@itp/utils";
import { LoginScreen } from "@itp/ui";

export default function LoginPage() {
  const { login, logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && role === "mentor") {
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
      if (result.role !== "mentor") {
        await logout();
        setError("Access denied. Mentor credentials required.");
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
      variant="mentor"
      title="Mentor Portal"
      subtitle="Sign in with your Employee ID"
      fields={[
        {
          name: "identifier",
          label: "Employee ID",
          placeholder: "e.g. NAT-EMP-1234",
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
        <p className="mt-4 text-center text-xs text-text-light">
          Default password is your Employee ID
        </p>
      }
    />
  );
}
