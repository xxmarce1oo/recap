// arquivo: src/pages/RecommendationsPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDailyRecommendations, EnrichedRecommendation } from '../services/recommendationService';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';

export default function RecommendationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getDailyRecommendations(user.id);
        setRecommendations(data);
      } catch (err) {
        setError("Não foi possível carregar as suas recomendações diárias.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, [user, authLoading]);

 // ✅ MUDANÇA: Agora agrupa pela nova coluna 'category'
  const groupedRecommendations = useMemo(() => {
    if (!recommendations) return {};
    return recommendations.reduce((acc, rec) => {
      // Usamos a 'category' que definimos no backend como chave
      const category = (rec as any).category || "Sugestões para você"; 
      if (!acc[category]) acc[category] = [];
      acc[category].push(rec);
      return acc;
    }, {} as Record<string, EnrichedRecommendation[]>);
  }, [recommendations]);
  
  if (authLoading || isLoading) {
    return <div className="text-center py-24">A procurar as suas recomendações de hoje...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-6 md:px-12 text-center py-24">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-gray-400 mt-2">Você precisa estar logado para ver suas recomendações.</p>
        <Link to="/" className="text-cyan-400 mt-4 inline-block hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-12 py-24">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Para Você</h1>
        <p className="text-gray-400 mt-2">Novas sugestões todos os dias, selecionadas especialmente com base no seu gosto.</p>
      </div>

      {error && <p className="text-center text-lg text-red-500">{error}</p>}
      
      {Object.keys(groupedRecommendations).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groupedRecommendations).map(([reason, recs]) => (
            <section key={reason}>
              <h2 className="text-2xl font-bold mb-4">{reason}</h2>
              {/* ✅ MUDANÇA: Grid com exatamente 6 colunas para telas grandes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
                {recs.map(rec => <MovieCard key={rec.id} movie={rec.movie} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold">Nenhuma recomendação por hoje</h2>
          <p className="text-gray-400 mt-2">A nossa mágica acontece uma vez por dia. Volte amanhã ou avalie mais filmes para receber sugestões!</p>
        </div>
      )}
    </div>
  );
}