// arquivo: src/components/SkeletonCarousel.tsx

export default function SkeletonCarousel() {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-300 dark:bg-gray-800 rounded animate-pulse w-1/3"></div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 w-48 h-72 bg-gray-300 dark:bg-gray-800 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    )
  }