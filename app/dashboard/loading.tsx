/**
 * Dashboard segment loading boundary. Shown while the dashboard page
 * is fetching user and dashboard data on the server. Uses the same
 * skeleton as DashboardClient to avoid layout shift when content loads.
 */
import { DashboardSkeleton } from "./v2/DashboardClient";

export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
