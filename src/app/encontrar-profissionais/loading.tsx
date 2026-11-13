export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-28 bg-white/10 rounded" />
        <div className="h-9 w-72 bg-white/10 rounded" />
        <div className="h-4 w-96 bg-white/10 rounded" />
      </div>

      {/* Legal Box Skeleton */}
      <div className="h-16 w-full bg-white/5 rounded-2xl border border-white/10" />

      {/* Main Skeleton Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-72 h-96 bg-white/5 rounded-2xl border border-white/10" />

        {/* Cards Grid Skeleton */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-white/10 rounded" />
              <div className="h-3 w-4/5 bg-white/10 rounded" />
              <div className="h-8 w-full bg-white/10 rounded-xl mt-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

