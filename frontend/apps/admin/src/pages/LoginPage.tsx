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

  if (isAuthenticated && role === "admin") {
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
      if (result.role !== "admin") {
        await logout();
        setError("Access denied. Admin credentials required.");
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
      variant="admin"
      title="Welcome Back!"
      subtitle="Sign in to access your dashboard."
      logo={
        <span className="text-2xl font-bold text-admin-text">
          Nex<span className="text-blue-400">Altis</span>
        </span>
      }
      fields={[
        {
          name: "identifier",
          label: "NexAltis ID",
          placeholder: "NexAltis ID",
          icon: "fas fa-id-badge",
          iconType: "fontawesome",
        },
        {
          name: "password",
          label: "Code",
          type: "password",
          placeholder: "Your access code",
          icon: "fas fa-lock",
          iconType: "fontawesome",
        },
      ]}
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
}
