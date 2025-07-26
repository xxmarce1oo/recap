import { Update } from '../viewmodels/useUpdatesViewModel';
import { UpdateItem } from './UpdateItem';
import { UpdateSkeleton } from './UpdateSkeleton';

interface UpdatesListProps {
  updates: Update[];
  isLoading: boolean;
  error: string | null;
}

export const UpdatesList = ({ updates, isLoading, error }: UpdatesListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <UpdateSkeleton />
        <UpdateSkeleton />
        <UpdateSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          Nenhuma atualização encontrada para o filtro selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {updates.map((update, index) => (
        <UpdateItem
          key={update.hash}
          update={update}
          isLast={index === updates.length - 1}
        />
      ))}
    </div>
  );
};