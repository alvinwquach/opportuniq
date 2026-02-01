/**
 * Root loading boundary. Shown while the root layout or any child segment
 * is resolving (e.g. auth, layout data). Prefer segment-level loading.tsx
 * for route-specific skeletons to avoid layout shift.
 */
export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
