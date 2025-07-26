// arquivo: scripts/generate-updates.cjs

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Gerando log de atualizações a partir dos commits...');

// ✅ CONFIGURAÇÃO DOS TIPOS DE COMMIT E CORES
const COMMIT_TYPES = {
  'feat':   { label: 'Nova Funcionalidade', color: 'bg-blue-500'   }, // Azul
  'update': { label: 'Melhoria',            color: 'bg-green-500'  }, // Verde
  'fix':    { label: 'Correção de Erro',    color: 'bg-red-500'    }, // Vermelho
  // (Opcional) Você pode adicionar 'perf' ou outros tipos aqui no futuro
  // 'perf': { label: 'Performance', color: 'bg-purple-500' },
};

const publicDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(publicDir, 'updates.json');

const COMMIT_DELIMITER = '---END_OF_COMMIT---';
const FIELD_DELIMITER = '|||';

// Pega as chaves do objeto COMMIT_TYPES para usar no filtro (ex: ['feat', 'update', 'fix'])
const INCLUDED_PREFIXES = Object.keys(COMMIT_TYPES);

try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const gitLogOutput = execSync(
    `git log --pretty=format:"%H${FIELD_DELIMITER}%ad${FIELD_DELIMITER}%s${FIELD_DELIMITER}%b%n${COMMIT_DELIMITER}" --date=iso`
  ).toString();

  const commits = gitLogOutput
    .split(COMMIT_DELIMITER)
    .filter(line => line.trim() !== '')
    .map(line => {
      const [hash, date, message, description] = line.trim().split(FIELD_DELIMITER);
      
      const match = message.match(/^(\w+)(\(.*\))?:\s*(.*)$/);
      if (!match) return null;

      const type = match[1].toLowerCase();
      const cleanMessage = match[3];

      if (!COMMIT_TYPES[type]) return null;

      return {
        hash,
        date,
        type,
        label: COMMIT_TYPES[type].label,
        color: COMMIT_TYPES[type].color,
        message: cleanMessage,
        description: description.trim(),
      };
    })
    .filter(Boolean);

  fs.writeFileSync(outputPath, JSON.stringify(commits, null, 2));
  console.log(`Sucesso! ${commits.length} atualizações salvas em public/updates.json`);

} catch (error) {
  console.error('Erro ao gerar o log de atualizações:', error);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
}