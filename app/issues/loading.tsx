/**
 * Issues segment loading boundary. Shown while the issues page
 * is resolving auth and group membership on the server. Uses
 * the same skeleton as IssuesClient for consistent layout.
 */
import { IssuesSkeleton } from "./components";

export default function IssuesLoading() {
  return <IssuesSkeleton />;
}