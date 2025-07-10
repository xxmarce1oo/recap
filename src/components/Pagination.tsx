// ficheiro: src/components/Pagination.tsx

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  
  export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
    if (totalPages <= 1) {
      return null;
    }
  
    const handlePrevious = () => {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    };
  
    const handleNext = () => {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    };
    
    // Lógica para gerar os números das páginas (pode ser expandida para mostrar "...")
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  
    return (
      <nav className="flex items-center justify-center gap-2 text-white">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-cyan-600 transition-colors"
        >
          Anterior
        </button>
  
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-3 py-1 rounded-md transition-colors ${
              currentPage === number
                ? 'bg-cyan-500 font-bold'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {number}
          </button>
        ))}
  
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-cyan-600 transition-colors"
        >
          Próxima
        </button>
      </nav>
    );
  }