export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-40 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-5 w-10 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="h-9 w-36 bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Introduction */}
        <div className="mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="h-6 w-40 bg-gray-800 rounded animate-pulse mb-3"></div>
            <div className="h-4 w-full bg-gray-800 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-full bg-gray-800 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Guidelines with timeline */}
        <div className="relative">
          {/* Vertical timeline */}
          <div className="absolute left-[22px] top-0 bottom-0 w-0 border-l border-gray-700 h-full"></div>

          {/* Skeleton sections */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative mb-8">
              <div className="w-11 flex-shrink-0 pt-1 text-gray-500 text-sm relative">
                <div className="h-4 w-6 bg-gray-800 rounded animate-pulse"></div>
                <div className="absolute left-7 top-2 w-3 h-3 bg-gray-700 rounded-full transform -translate-x-1/2 z-20"></div>
              </div>

              <div className="ml-10 bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-5 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-6 w-48 bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="ml-7">
                  <div className="h-4 w-full bg-gray-800 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-full bg-gray-800 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
