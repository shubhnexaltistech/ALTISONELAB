import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute, SkeletonPage } from "@itp/ui";
import { MentorLayout } from "./components/MentorLayout";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TraineesPage = lazy(() => import("./pages/TraineesPage"));
const WorklogsPage = lazy(() => import("./pages/WorklogsPage"));
const EvaluationsPage = lazy(() => import("./pages/EvaluationsPage"));

function Loader() {
  return <SkeletonPage />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Suspense fallback={<Loader />}><LoginPage /></Suspense> },
  { path: "/forgot-password", element: <Suspense fallback={<Loader />}><ForgotPasswordPage /></Suspense> },
  { path: "/reset-password", element: <Suspense fallback={<Loader />}><ResetPasswordPage /></Suspense> },
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={["mentor"]} loginPath="/login">
        <MentorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><DashboardPage /></Suspense> },
      { path: "trainees", element: <Suspense fallback={<Loader />}><TraineesPage /></Suspense> },
      { path: "worklogs", element: <Suspense fallback={<Loader />}><WorklogsPage /></Suspense> },
      { path: "evaluations", element: <Suspense fallback={<Loader />}><EvaluationsPage /></Suspense> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
