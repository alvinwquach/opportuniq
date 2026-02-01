/**
 * Admin segment loading boundary. Shown while the admin layout
 * is resolving auth. Matches admin dashboard grid layout to avoid layout shift.
 */
function AdminLoading() {
  return (
    <div className="animate-pulse p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-4 lg:gap-5">
        <div className="space-y-4 order-2 lg:order-1">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3 sm:p-4 h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 h-72" />
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 h-72" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 h-64" />
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 h-64" />
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 h-64" />
          </div>
        </div>
        <div className="space-y-3 order-1 lg:order-2">
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3 h-48" />
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3 h-64" />
          <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3 h-32" />
        </div>
      </div>
    </div>
  );
}

export default AdminLoading;
