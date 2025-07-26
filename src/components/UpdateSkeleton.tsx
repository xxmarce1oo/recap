export const UpdateSkeleton = () => (
  <div className="relative pl-8 pb-8 animate-pulse">
    {/* Bolinha skeleton */}
    <div 
      className="absolute w-4 h-4 bg-gray-600 rounded-full"
      style={{ left: '-8px', top: '24px' }}
    ></div>
    
    <div className="p-6 bg-gray-800/30 rounded-lg ml-2">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
        <div className="h-4 w-32 bg-gray-700 rounded"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-700 rounded mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-700 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
);