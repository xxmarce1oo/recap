import { Update } from '../viewmodels/useUpdatesViewModel';

interface UpdateItemProps {
  update: Update;
  isLast: boolean;
}

export const UpdateItem = ({ update, isLast }: UpdateItemProps) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getBadgeColor = (label?: string) => {
    switch (label?.toLowerCase()) {
      case 'melhoria':
        return 'bg-blue-500';
      case 'correção de erro':
        return 'bg-red-500';
      case 'nova funcionalidade':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-start gap-4 group">
      {/* Coluna da timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Bolinha */}
        <div 
          className={`w-4 h-4 rounded-full border-4 border-gray-900 ${getBadgeColor(update.label)} mt-6`}
        ></div>
        
        {/* Linha conectora */}
        {!isLast && (
          <div className="w-0.5 bg-gray-700 flex-1 mt-2 mb-2 min-h-[4rem]"></div>
        )}
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1 pb-8">
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-bold px-2 py-1 ${getBadgeColor(update.label)} text-white rounded-full`}>
              {update.label || 'Indefinido'}
            </span>
            <p className="text-sm text-gray-400">
              {formatDate(update.date)}
            </p>
          </div>

          <h2 className="text-xl font-semibold text-white mb-2">{update.message}</h2>
          
          {update.description && (
            <p className="text-gray-300 text-base whitespace-pre-line leading-relaxed">
              {update.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};