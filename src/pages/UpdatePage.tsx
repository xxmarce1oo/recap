import { memo } from 'react';
import { useUpdatesViewModel } from '../viewmodels/useUpdatesViewModel';
import { UpdateFilters } from '../components/UpdateFilters';
import { UpdatesList } from '../components/UpdatesList';

const UpdatesPage = memo(() => {
  const {
    updates,
    isLoading,
    error,
    activeFilter,
    availableFilters,
    setActiveFilter
  } = useUpdatesViewModel();

  return (
    <div className="container mx-auto px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Registro de Atualizações
          </h1>
          <p className="text-gray-400 text-lg">
            Aqui estão as últimas melhorias e novidades implementadas no The 1st rule.
          </p>
        </header>

        <UpdateFilters
          filters={availableFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          isLoading={isLoading}
        />

        <UpdatesList
          updates={updates}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
});

UpdatesPage.displayName = 'UpdatesPage';

export default UpdatesPage;
