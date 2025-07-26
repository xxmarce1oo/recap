// arquivo: scripts/generate-updates.cjs

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Gerando log de atualizações a partir dos commits...');

const publicDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(publicDir, 'updates.json');

// Delimitador customizado improvável de ser usado em mensagens de commit
const COMMIT_DELIMITER = '---END_OF_COMMIT---';
const FIELD_DELIMITER = '|||';

try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Modificamos o comando git log para incluir o corpo do commit (%b)
  //    e usamos um delimitador único para separar cada commit.
  const gitLogOutput = execSync(
    `git log --pretty=format:"%H${FIELD_DELIMITER}%ad${FIELD_DELIMITER}%s${FIELD_DELIMITER}%b%n${COMMIT_DELIMITER}" --date=short`
  ).toString();

  // 2. Processa a saída do git log
  const commits = gitLogOutput
    .split(COMMIT_DELIMITER) // Separa os commits pelo delimitador
    .filter(line => line.trim() !== '')
    .map(line => {
      const [hash, date, time, message, description] = line.trim().split(FIELD_DELIMITER);
      return { hash, date, time, message, description: description.trim() };
    })
    .filter(commit => commit.message && commit.message.startsWith('Update:')) // Filtra apenas os commits relevantes
    .map(commit => ({
      ...commit,
      message: commit.message.replace('Update:', '').trim(), // Limpa o prefixo do título
    }));

  if (commits.length > 0) {
    fs.writeFileSync(outputPath, JSON.stringify(commits, null, 2));
    console.log(`Sucesso! ${commits.length} atualizações salvas em public/updates.json`);
  } else {
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
    console.log('Nenhum commit de "Update:" encontrado. Arquivo de updates criado vazio.');
  }
} catch (error) {
  console.error('Erro ao gerar o log de atualizações:', error);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
}