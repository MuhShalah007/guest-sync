export default function TableSkeleton({ columns }) {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 flex">
            {Array(columns).fill(0).map((_, i) => (
              <div key={i} className="w-1/4 h-4 bg-gray-300 rounded mr-4" />
            ))}
          </div>
          
          {/* Rows */}
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="px-4 py-4 flex items-center">
              {Array(columns).fill(0).map((_, j) => (
                <div key={j} className="w-1/4 mr-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  {j === 1 && <div className="h-3 bg-gray-100 rounded w-1/2" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}