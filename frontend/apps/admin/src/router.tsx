import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute, SkeletonPage } from "@itp/ui";
import { AdminLayout } from "./components/AdminLayout";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage"));
const TracksPage = lazy(() => import("./pages/TracksPage"));
const ModulesPage = lazy(() => import("./pages/ModulesPage"));
const MentorsPage = lazy(() => import("./pages/MentorsPage"));
const QuizzesPage = lazy(() => import("./pages/QuizzesPage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));

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
      <ProtectedRoute allowedRoles={["admin"]} loginPath="/login">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><DashboardPage /></Suspense> },
      { path: "applications", element: <Suspense fallback={<Loader />}><ApplicationsPage /></Suspense> },
      { path: "tracks", element: <Suspense fallback={<Loader />}><TracksPage /></Suspense> },
      { path: "modules", element: <Suspense fallback={<Loader />}><ModulesPage /></Suspense> },
      { path: "mentors", element: <Suspense fallback={<Loader />}><MentorsPage /></Suspense> },
      { path: "employees", element: <Suspense fallback={<Loader />}><EmployeesPage /></Suspense> },
      { path: "quizzes", element: <Suspense fallback={<Loader />}><QuizzesPage /></Suspense> },
      { path: "announcements", element: <Suspense fallback={<Loader />}><AnnouncementsPage /></Suspense> },
      { path: "analytics", element: <Suspense fallback={<Loader />}><AnalyticsPage /></Suspense> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
