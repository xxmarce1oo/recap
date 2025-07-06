// arquivo: src/pages/AboutPage.tsx

export default function AboutPage() {
    return (
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 md:px-12 py-20 md:py-28">
          
          {/* Usamos um container com largura máxima para o texto não ficar muito esticado em telas grandes */}
          <div className="max-w-4xl mx-auto">
  
            {/* Título Principal */}
            <div className="text-center mb-12">
              <p className="text-lg font-semibold text-cyan-400">Nossa História</p>
              <h1 className="mt-2 text-4xl md:text-6xl font-bold tracking-tight text-white">
                A paixão por cinema transformada em tecnologia.
              </h1>
            </div>
  
            {/* Corpo do Texto com Estilo Aprimorado */}
            <article className="prose prose-invert prose-lg max-w-none space-y-6 text-gray-300">
              <p>
                O <strong className="font-semibold text-white">Recap</strong> nasceu de uma ambição: ir além do convencional. Fruto de um Trabalho de Conclusão de Curso (TCC) do curso de Análise e Desenvolvimento de Sistemas da  <strong className="font-semibold text-white">Universidade Federal do Paraná (UFPR)</strong>, o projeto foi idealizado por um grupo de estudantes apaixonados por tecnologia e, acima de tudo, por cinema.
              </p>
              <p>
                Inspirado por plataformas como o Letterboxd, mas com o desejo de oferecer uma experiência mais rica e inteligente, o grupo uniu sua paixão pela sétima arte à vontade de inovar. A questão central era simples, mas poderosa: como podemos usar a tecnologia para aprimorar a forma como descobrimos e interagimos com filmes?
              </p>
              
              {/* Seção de Diferenciais com mais destaque */}
              <div className="bg-gray-950/50 p-6 rounded-2xl border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-4">O Futuro da Descoberta</h2>
                <p>
                  O <strong>Recap</strong> se diferencia por duas funcionalidades inovadoras. A primeira é um <strong className="font-semibold text-cyan-300">sistema de recomendação híbrido</strong>, que aprende com seu gosto para oferecer sugestões que você realmente vai amar. A segunda é um <strong className="font-semibold text-cyan-300">chat integrado com IA Generativa</strong>, um verdadeiro especialista em cinema no seu bolso, pronto para te dar recomendações com base em qualquer pedido, por mais específico que seja.
                </p>
              </div>
  
              {/* Seção da Equipe */}
              <div>
                <h3 className="text-xl font-bold text-white">A Equipe Fundadora:</h3>
                <p className="mt-2">
                  Marcelo Batista, Guilherme Viol, Pedro Ribeiro, Nathiele Leal e Maria Frank.
                </p>
              </div>
  
              <p>
                Nossa missão é criar a plataforma definitiva para amantes de cinema, combinando a paixão da comunidade com o poder da inteligência artificial. Bem-vindo ao Recap.
              </p>
            </article>
  
          </div>
        </div>
      </div>
    );
  }