import { useAuthBootstrap } from "@itp/hooks";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@itp/hooks";
import type { UserRole } from "@itp/utils";
import { SkeletonPage } from "./Skeleton";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  loginPath?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  loginPath = "/login",
}: ProtectedRouteProps) {
  const { isBootstrapping } = useAuthBootstrap();
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (isBootstrapping) return <SkeletonPage />;

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
}
