import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute, SkeletonPage } from "@itp/ui";
import { LmsLayout } from "./components/LmsLayout";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ModulesPage = lazy(() => import("./pages/ModulesPage"));
const ModuleDetailPage = lazy(() => import("./pages/ModuleDetailPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const WorklogsPage = lazy(() => import("./pages/WorklogsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const AssignmentsPage = lazy(() => import("./pages/AssignmentsPage"));
const SubmissionsPage = lazy(() => import("./pages/SubmissionsPage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
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
      <ProtectedRoute allowedRoles={["trainee"]} loginPath="/login">
        <LmsLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><DashboardPage /></Suspense> },
      { path: "modules", element: <Suspense fallback={<Loader />}><ModulesPage /></Suspense> },
      { path: "modules/:moduleId", element: <Suspense fallback={<Loader />}><ModuleDetailPage /></Suspense> },
      { path: "quiz/:quizId", element: <Suspense fallback={<Loader />}><QuizPage /></Suspense> },
      { path: "worklogs", element: <Suspense fallback={<Loader />}><WorklogsPage /></Suspense> },
      { path: "assignments", element: <Suspense fallback={<Loader />}><AssignmentsPage /></Suspense> },
      { path: "submissions", element: <Suspense fallback={<Loader />}><SubmissionsPage /></Suspense> },
      { path: "announcements", element: <Suspense fallback={<Loader />}><AnnouncementsPage /></Suspense> },
      { path: "evaluations", element: <Suspense fallback={<Loader />}><EvaluationsPage /></Suspense> },
      { path: "profile", element: <Suspense fallback={<Loader />}><ProfilePage /></Suspense> },
      { path: "leaderboard", element: <Suspense fallback={<Loader />}><LeaderboardPage /></Suspense> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
