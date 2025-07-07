// arquivo: src/pages/AboutPage.tsx

export default function AboutPage() {
  return (
    <div className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 md:px-12 py-20 md:py-28">
        
        <div className="max-w-4xl mx-auto">

          {/* Título Principal com a referência a Clube da Luta */}
          <div className="text-center mb-12">
            <p className="text-lg font-semibold text-cyan-400">Nossa Filosofia</p>
            <h1 className="mt-2 text-4xl md:text-6xl font-bold tracking-tight text-white">
              A primeira regra do Clube do Cinema é: <br/> você <em className="italic text-cyan-300">fala</em> sobre o Clube do Cinema.
            </h1>
          </div>

          {/* Corpo do Texto */}
          <article className="prose prose-invert prose-lg max-w-none space-y-6 text-gray-300">
            <p>
              O <strong className="font-semibold text-white">The 1st rule</strong> nasceu de um conceito ambicioso, originalmente pensado para um Trabalho de Conclusão de Curso (TCC). A ideia, no entanto, era grande demais para ficar apenas no papel. A paixão pelo cinema e pela tecnologia foi o combustível para transformar um projeto acadêmico em uma missão pessoal.
            </p>
            <p>
              Inspirado por plataformas como o Letterboxd, mas com o desejo de oferecer uma experiência mais rica e inteligente, o projeto une a paixão pela sétima arte à vontade de inovar. A questão central era simples, mas poderosa: como posso usar a tecnologia para aprimorar a forma como descobrimos e interagimos com filmes?
            </p>
            
            {/* Seção de Diferenciais */}
            <div className="bg-gray-950/50 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-4">O Futuro da Descoberta</h2>
              <p>
                O <strong>The 1st rule</strong> se diferencia por duas funcionalidades inovadoras. A primeira é um <strong className="font-semibold text-cyan-300">sistema de recomendação híbrido</strong>, que aprende com seu gosto para oferecer sugestões que você realmente vai amar. A segunda é um <strong className="font-semibold text-cyan-300">chat integrado com IA Generativa</strong>, um verdadeiro especialista em cinema no seu bolso, pronto para te dar recomendações com base em qualquer pedido, por mais específico que seja.
              </p>
            </div>

            {/* Seção do Criador */}
            <div>
              <h3 className="text-xl font-bold text-white">Sobre o criador, Marcelo Batista:</h3>
              <p className="mt-2">
                "Sempre fui fascinado por duas coisas: a forma como a tecnologia pode resolver problemas e a maneira como os filmes podem contar histórias. Este projeto é a intersecção dessas duas paixões. Para mim, desenvolver o 'The 1st rule' é mais do que criar um software; é construir a ferramenta que eu, como cinéfilo, sempre quis ter. É um desafio constante de aprendizado, desde a implementação de algoritmos de recomendação até a integração com as mais novas IAs, e a minha motivação é criar uma comunidade onde outros apaixonados por cinema possam ter a melhor experiência possível."
              </p>
            </div>

            <p>
              A missão é criar a plataforma definitiva para amantes de cinema, combinando a paixão da comunidade com o poder da inteligência artificial. Bem-vindo ao clube. Quebre a primeira regra.
            </p>
          </article>

        </div>
      </div>
    </div>
  );
}