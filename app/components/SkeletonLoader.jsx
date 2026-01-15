'use client';

export default function SkeletonLoader() {
  return (
    <div className="min-h-screen">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-text">
            <div className="icon-wrapper">
              <div className="icon-circle"></div>
              <i className="fi fi-rr-book-alt"></i>
            </div>
            <h1>Articles Directory</h1>
          </div>
          <div className="results-count">
            <div className="animate-pulse bg-gray-300 h-6 w-32 rounded"></div>
          </div>
        </div>
      </div>
      
      <div className="tableau max-w-7xl mx-auto px-8 py-8">
        {/* Skeleton KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="animate-pulse bg-gray-200 h-4 w-24 rounded mb-2"></div>
              <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Skeleton Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="animate-pulse bg-gray-200 h-4 w-40 rounded mb-4"></div>
              <div className="animate-pulse bg-gray-100 h-48 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Skeleton Filters */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-300 h-10 rounded-lg"></div>
            ))}
          </div>
        </div>
        
        {/* Skeleton Table */}
        <div className="bg-white overflow-hidden mb-8 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Categories</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Excerpt</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Link</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {[...Array(10)].map((_, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-300 h-4 w-3/4 rounded mb-2"></div>
                    <div className="flex gap-1">
                      <div className="animate-pulse bg-gray-200 h-5 w-16 rounded-full"></div>
                      <div className="animate-pulse bg-gray-200 h-5 w-20 rounded-full"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-300 h-6 w-24 rounded-full"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-300 h-4 w-32 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-300 h-4 w-full rounded mb-1"></div>
                    <div className="animate-pulse bg-gray-300 h-4 w-5/6 rounded"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="animate-pulse bg-gray-300 h-8 w-8 rounded-lg mx-auto"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-300 h-9 w-16 rounded-lg"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}