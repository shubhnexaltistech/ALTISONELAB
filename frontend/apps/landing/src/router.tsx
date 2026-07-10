import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { SkeletonPage } from "@itp/ui";

const HomePage = lazy(() => import("./pages/HomePage"));
const TrackPage = lazy(() => import("./pages/TrackPage"));
const ApplyPage = lazy(() => import("./pages/ApplyPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const ApplicationStatusPage = lazy(() => import("./pages/ApplicationStatusPage"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <SkeletonPage />
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense> },
  { path: "/track/:slug", element: <Suspense fallback={<PageLoader />}><TrackPage /></Suspense> },
  { path: "/apply", element: <Suspense fallback={<PageLoader />}><ApplyPage /></Suspense> },
  { path: "/payment/:applicationId", element: <Suspense fallback={<PageLoader />}><PaymentPage /></Suspense> },
  { path: "/status/:applicationId", element: <Suspense fallback={<PageLoader />}><ApplicationStatusPage /></Suspense> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
