// arquivo: scripts/generate-updates.cjs

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Gerando log de atualizações a partir dos commits...');

const publicDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(publicDir, 'updates.json');

const COMMIT_DELIMITER = '---END_OF_COMMIT---';
const FIELD_DELIMITER = '|||';

const INCLUDED_PREFIXES = ['update:', 'feat:'];

try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // ✅ CORREÇÃO AQUI: Mudamos --date=short para --date=iso
  // Isso nos dará a data e a hora em um formato padrão (ex: "2024-05-21 15:30:00 -0300")
  const gitLogOutput = execSync(
    `git log --pretty=format:"%H${FIELD_DELIMITER}%ad${FIELD_DELIMITER}%s${FIELD_DELIMITER}%b%n${COMMIT_DELIMITER}" --date=iso`
  ).toString();

  const commits = gitLogOutput
    .split(COMMIT_DELIMITER)
    .filter(line => line.trim() !== '')
    .map(line => {
      // Voltamos a ter 4 campos, mas agora o 'date' contém a hora
      const [hash, date, message, description] = line.trim().split(FIELD_DELIMITER);
      return { hash, date, message, description: description.trim() };
    })
    .filter(commit => {
        if (!commit.message) return false;
        const lowerCaseMessage = commit.message.toLowerCase();
        return INCLUDED_PREFIXES.some(prefix => lowerCaseMessage.startsWith(prefix));
    })
    .map(commit => {
        let cleanMessage = commit.message;
        const lowerCaseMessage = commit.message.toLowerCase();

        for (const prefix of INCLUDED_PREFIXES) {
            if (lowerCaseMessage.startsWith(prefix)) {
                cleanMessage = commit.message.substring(prefix.length).trim();
                break; 
            }
        }
        
        cleanMessage = cleanMessage.replace(/^\(.*\):\s*/, '');

        return { ...commit, message: cleanMessage };
    });

  if (commits.length > 0) {
    fs.writeFileSync(outputPath, JSON.stringify(commits, null, 2));
    console.log(`Sucesso! ${commits.length} atualizações salvas em public/updates.json`);
  } else {
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
    console.log('Nenhum commit de "Update:" ou "feat:" encontrado. Arquivo de updates criado vazio.');
  }
} catch (error) {
  console.error('Erro ao gerar o log de atualizações:', error);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
}