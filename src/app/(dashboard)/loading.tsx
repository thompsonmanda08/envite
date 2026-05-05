import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className=" mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 flex-col md:flex-row sm:justify-between gap-4">
            {/* Main Greeting Card */}
            <div className="bg-gradient-to-r md:col-span-3 shadow-none flex-1 from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-7 sm:h-8 lg:h-9 w-48 bg-slate-300/50 sm:w-56 lg:w-64" />
                    <Skeleton className="h-6 sm:h-7 lg:h-8 w-8 bg-slate-300/50 rounded-full" />
                  </div>
                  <Skeleton className="h-4 sm:h-5 w-56 sm:w-64 lg:w-72 bg-slate-300/50" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <Skeleton className="h-9 w-24 sm:w-28 rounded-lg bg-gray-800" />
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="border border-green-200 shadow-none hover:shadow-sm transition-shadow duration-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg md:max-w-sm flex-1">
              <div className="p-6 pb-4">
                <div className="flex items-center mb-2">
                  <div className="w-5 h-5 bg-green-600 rounded mr-2"></div>
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-4" />
              </div>
              <div className="px-6 pb-6">
                <div className="w-full h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-md flex items-center justify-center gap-2">
                  <div className="w-5 h-5 bg-white/20 rounded"></div>
                  <div className="w-36 h-3 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
              {/* Total Products Card */}
              <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-3 lg:h-4 w-16 lg:w-24 mb-2" />
                    <Skeleton className="h-6 lg:h-8 w-4 lg:w-8 mb-1" />
                    <Skeleton className="h-2 lg:h-3 w-12 lg:w-20" />
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Total Views Card */}
              <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-3 lg:h-4 w-14 lg:w-20 mb-2" />
                    <Skeleton className="h-6 lg:h-8 w-4 lg:w-8 mb-1" />
                    <Skeleton className="h-2 lg:h-3 w-10 lg:w-16 bg-green-200" />
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-3 lg:h-4 w-16 lg:w-24 mb-2" />
                    <Skeleton className="h-6 lg:h-8 w-4 lg:w-8 mb-1" />
                    <Skeleton className="h-2 lg:h-3 w-10 lg:w-16" />
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Store Health Card */}
              <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-3 lg:h-4 w-14 lg:w-20 mb-2" />
                    <Skeleton className="h-6 lg:h-8 w-8 lg:w-12 mb-1" />
                    <Skeleton className="h-2 lg:h-3 w-20 lg:w-28" />
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 lg:h-6 w-24 lg:w-32" />
                  <Skeleton className="h-3 lg:h-4 w-12 lg:w-16" />
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <Skeleton className="h-3 w-24" />
                      <div className="flex items-center">
                        <Skeleton
                          className={`h-5 w-14 rounded-full ${
                            i === 0
                              ? "bg-green-200"
                              : i === 1 || i === 3
                              ? "bg-yellow-200"
                              : i === 2
                              ? "bg-red-200"
                              : "bg-green-200"
                          }`}
                        />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                {/* Table Header */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-100">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-6 py-4">
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-28" />
                        <div className="flex items-center">
                          <Skeleton
                            className={`h-6 w-16 rounded-full ${
                              i === 0
                                ? "bg-green-200"
                                : i === 1 || i === 3
                                ? "bg-yellow-200"
                                : i === 2
                                ? "bg-red-200"
                                : "bg-green-200"
                            }`}
                          />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            {/* Getting Started */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Skeleton className="h-5 w-28 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full ${
                        i < 3 ? "bg-green-500" : "bg-gray-300"
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      {i < 3 && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between mb-4"
                  >
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Sidebar */}
          <div className="block lg:hidden space-y-4">
            {/* Getting Started */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <Skeleton className="h-5 w-28 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        i < 3 ? "bg-green-500" : "bg-gray-300"
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      {i < 3 && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <Skeleton className="h-3 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
