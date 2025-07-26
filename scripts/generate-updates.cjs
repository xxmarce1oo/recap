// arquivo: scripts/generate-updates.cjs

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Gerando log de atualizações a partir dos commits...');

const publicDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(publicDir, 'updates.json');

try {
  // ✅ CORREÇÃO: Garante que o diretório 'public' exista antes de escrever o arquivo.
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const gitLogOutput = execSync(
    'git log --pretty=format:"%H|||%ad|||%s" --date=short'
  ).toString();

  const commits = gitLogOutput
    .split('\n')
    .map(line => {
      const [hash, date, message] = line.split('|||');
      return { hash, date, message };
    })
    .filter(commit => commit.message && commit.message.startsWith('Update:'))
    .map(commit => ({
      ...commit,
      message: commit.message.replace('Update:', '').trim(),
    }));

  if (commits.length > 0) {
    fs.writeFileSync(outputPath, JSON.stringify(commits, null, 2));
    console.log(`Sucesso! ${commits.length} atualizações salvas em public/updates.json`);
  } else {
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2)); // Cria um arquivo vazio se não houver updates
    console.log('Nenhum commit de "Update:" encontrado. Arquivo de updates criado vazio.');
  }
} catch (error) {
  console.error('Erro ao gerar o log de atualizações:', error);
  // Garante que o diretório exista mesmo em caso de erro
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  // Cria um arquivo vazio para não quebrar o build
  fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
}