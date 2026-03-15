export default function SeekerDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0e0e1a]">
      {/* Header Skeleton */}
      <div className="border-b border-white/[0.06] px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-black tracking-tight text-white">i<span className="text-violet-400">need</span></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-7 bg-white/[0.06] rounded-lg animate-pulse" />
          <div className="w-20 h-7 bg-white/[0.06] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Search CTA Skeleton */}
      <div className="border-b border-white/[0.06] px-4 py-4 flex justify-center">
        <div className="w-48 h-12 bg-violet-600/20 rounded-xl animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5">
              <div className="w-10 h-8 bg-white/[0.06] rounded animate-pulse mb-2" />
              <div className="w-20 h-3 bg-white/[0.04] rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* List Skeleton */}
        <div className="w-32 h-5 bg-white/[0.06] rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="w-48 h-4 bg-white/[0.06] rounded animate-pulse" />
                <div className="w-24 h-3 bg-white/[0.04] rounded animate-pulse" />
              </div>
              <div className="w-16 h-3 bg-white/[0.04] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
