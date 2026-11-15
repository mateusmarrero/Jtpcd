const bcrypt = require('bcryptjs');
const pool = require('./db.js');

async function migrateSecurity() {
  console.log('🔒 Iniciando Migração de Segurança de Senhas para Bcrypt...');

  // 1. Gerar novos hashes bcrypt fortes
  const adminPass = 'JtPcd#Admin!2026';
  const mateusPass = 'Mateus#JtPcd2026!';

  const adminHash = await bcrypt.hash(adminPass, 10);
  const mateusHash = await bcrypt.hash(mateusPass, 10);

  // 2. Atualizar admin
  await pool.execute(
    'UPDATE admin_users SET senha_hash = ?, role = "admin" WHERE id = 1 OR username = "admin"',
    [adminHash]
  );
  console.log('✅ Usuário admin atualizado com hash Bcrypt e senha não padrão.');

  // 3. Atualizar mateusmarrero
  await pool.execute(
    'UPDATE admin_users SET senha_hash = ?, role = "admin" WHERE username = "mateusmarrero"',
    [mateusHash]
  );
  console.log('✅ Usuário mateusmarrero atualizado com hash Bcrypt.');

  // 4. Registrar em audit_logs
  await pool.execute(
    'INSERT INTO audit_logs (usuario, acao, modulo, detalhes, ip) VALUES (?, ?, ?, ?, ?)',
    ['SISTEMA_SEGURANCA', 'Migração Bcrypt', 'Autenticação', 'Senhas padrão eliminadas e migradas para Bcrypt (cost 10)', '127.0.0.1']
  );
  console.log('✅ Registro gravado na tabela de auditoria.');

  console.log('🎉 Migração concluída com sucesso!');
  process.exit(0);
}

migrateSecurity().catch(e => {
  console.error('Erro na migração:', e);
  process.exit(1);
});
