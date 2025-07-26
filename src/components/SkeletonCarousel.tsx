// arquivo: src/components/SkeletonCarousel.tsx

export default function SkeletonCarousel() {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="h-6 sm:h-8 bg-gray-300 dark:bg-gray-800 rounded animate-pulse w-1/3"></div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 sm:gap-4 md:grid-cols-6 md:gap-4 lg:flex lg:justify-between">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60 lg:w-48 lg:h-72 bg-gray-300 dark:bg-gray-800 rounded-lg animate-pulse mx-auto lg:mx-0 ${i >= 4 ? 'hidden sm:block' : ''}`}
            ></div>
          ))}
        </div>
      </div>
    )
  }