import { useState, useRef } from 'react';
import { Movie } from '../models/movie';

interface BackdropSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
  backdrops: any[];
  onBackdropSelect: (backdropPath: string, position: string) => void;
}

export default function BackdropSelectionModal({
  isOpen,
  onClose,
  movie,
  backdrops,
  onBackdropSelect,
}: BackdropSelectionModalProps) {
  const [selectedBackdrop, setSelectedBackdrop] = useState<any | null>(null);
  const [position, setPosition] = useState('center');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handlePositionChange = (e: React.MouseEvent) => {
    if (!containerRef.current || !isDragging) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.min(100, Math.max(0, (y / rect.height) * 100));
    
    setPosition(`${Math.round(percentage)}%`);
  };

  const startDrag = (e: React.MouseEvent) => {
    setIsDragging(true);
    // Força a mudança do cursor no documento inteiro para evitar flickering
    document.body.style.cursor = 'grabbing';
  };

  const endDrag = () => {
    setIsDragging(false);
    document.body.style.cursor = ''; // Retorna ao cursor padrão
  };

  const handleSelect = () => {
    if (selectedBackdrop) {
      onBackdropSelect(selectedBackdrop.file_path, position);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold">
            Selecionar Backdrop para {movie?.title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4 overflow-y-auto max-h-[60vh]">
            <h4 className="font-medium">Opções de Backdrop</h4>
            <div className="grid grid-cols-2 gap-2">
              {backdrops.map((backdrop) => (
                <div
                  key={backdrop.file_path}
                  className={`cursor-pointer border-2 ${selectedBackdrop?.file_path === backdrop.file_path ? 'border-cyan-500' : 'border-transparent'}`}
                  onClick={() => setSelectedBackdrop(backdrop)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${backdrop.file_path}`}
                    alt="Backdrop"
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Pré-visualização do Banner</h4>
            <div 
              ref={containerRef}
              className={`relative w-full aspect-[3/1] bg-gray-800 rounded-lg overflow-hidden ${
                selectedBackdrop ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
              }`}
              onMouseMove={handlePositionChange}
              onMouseDown={startDrag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
            >
              {selectedBackdrop ? (
                <>
                  {/* Imagem de fundo com posição ajustável */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(https://image.tmdb.org/t/p/original${selectedBackdrop.file_path})`,
                      backgroundPosition: `center ${position}`,
                    }}
                  />
                  
                  {/* Sobreposição escura gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Conteúdo do banner (simulando o perfil) */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-end gap-4">
                      {/* Conteúdo do perfil pode ser adicionado aqui */}
                    </div>
                  </div>
                  
                  {/* Instrução de arraste */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded text-center">
                    <p>Arraste para ajustar a posição</p>
                    <p className="text-xs opacity-70">Posição atual: {position}</p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Selecione um backdrop para pré-visualizar
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div>
                {selectedBackdrop && (
                  <span className="text-sm text-gray-400">
                    Posição: {position}
                  </span>
                )}
              </div>
              <button
                onClick={handleSelect}
                disabled={!selectedBackdrop}
                className={`px-4 py-2 rounded-md ${selectedBackdrop ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-700 cursor-not-allowed'}`}
              >
                Aplicar Banner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}