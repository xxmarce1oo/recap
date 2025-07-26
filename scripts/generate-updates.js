// arquivo: scripts/generate-updates.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Gerando log de atualizações a partir dos commits...');

try {
  // 1. Executa o comando git log com um formato customizado
  // Formato: hash ||| data (YYYY-MM-DD) ||| mensagem
  const gitLogOutput = execSync(
    'git log --pretty=format:"%H|||%ad|||%s" --date=short'
  ).toString();

  // 2. Processa a saída do git log
  const commits = gitLogOutput
    .split('\n')
    .map(line => {
      const [hash, date, message] = line.split('|||');
      return { hash, date, message };
    })
    .filter(commit => commit.message && commit.message.startsWith('Update:')) // 3. Filtra apenas os commits relevantes
    .map(commit => ({
      ...commit,
      // 4. Limpa o prefixo "Update: " da mensagem para exibição
      message: commit.message.replace('Update:', '').trim(),
    }));

  if (commits.length > 0) {
    // 5. Salva os commits processados em um arquivo JSON na pasta public
    const outputPath = path.join(__dirname, '..', 'public', 'updates.json');
    fs.writeFileSync(outputPath, JSON.stringify(commits, null, 2));
    console.log(`Sucesso! ${commits.length} atualizações salvas em public/updates.json`);
  } else {
    console.log('Nenhum commit de "Update:" encontrado. Nenhum arquivo de updates foi gerado.');
  }
} catch (error) {
  console.error('Erro ao gerar o log de atualizações:', error);
  // Cria um arquivo vazio em caso de erro para não quebrar o build
  const outputPath = path.join(__dirname, '..', 'public', 'updates.json');
  fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
}