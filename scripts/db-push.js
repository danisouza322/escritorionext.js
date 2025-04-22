const { exec } = require('child_process');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config();

// Verifica se a variável DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  console.error('A variável de ambiente DATABASE_URL não está definida.');
  process.exit(1);
}

// Comando para executar o drizzle-kit push
const command = 'npx drizzle-kit push:pg';

console.log('Executando migração do banco de dados...');

// Executa o comando
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o comando: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Erro: ${stderr}`);
    return;
  }
  
  console.log(`Saída: ${stdout}`);
  console.log('Migração concluída com sucesso!');
});