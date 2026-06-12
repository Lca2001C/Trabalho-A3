// =============================================================================
// ConectaBem — Inicializador Automático Completo (multiplataforma)
// =============================================================================
// Um único comando faz TODO o processo de inicialização:
//
//   node start.js            → inicializa e publica via NGROK
//   node start.js --seed     → o mesmo, mas também popula o banco (seed)
//   node start.js --no-ngrok → roda só localmente, sem abrir o túnel
//
// Etapas executadas em sequência:
//   1. Verifica Node.js
//   2. Garante que os arquivos .env existam (cria a partir dos .env.example)
//   3. Instala dependências onde faltar node_modules (raiz, backend, frontend)
//   4. Prisma: generate + migrate deploy (+ seed opcional)
//   5. Sobe o backend (porta 3001) e aguarda o health check
//   6. Sobe o frontend Vite (porta 5173) e aguarda ficar pronto
//   7. Abre o túnel NGROK apontando para o frontend (proxy /api → backend)
//   8. Encerra tudo de forma limpa ao pressionar Ctrl+C
//
// Funciona em Windows, macOS e Linux.
// =============================================================================

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// ─── Configuração ─────────────────────────────────────────────────────────────
const ROOT = __dirname;
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 5173;

const ARGS = process.argv.slice(2);
const DO_SEED = ARGS.includes('--seed');
const NO_NGROK = ARGS.includes('--no-ngrok');

// npm/npx corretos por plataforma
const IS_WIN = process.platform === 'win32';
const NPM = IS_WIN ? 'npm.cmd' : 'npm';
const NPX = IS_WIN ? 'npx.cmd' : 'npx';

// Processos filhos gerenciados (para encerramento limpo)
const children = [];

// ─── Logging ──────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m',
  yellow: '\x1b[33m', red: '\x1b[31m', gray: '\x1b[90m',
  magenta: '\x1b[35m', blue: '\x1b[34m', bold: '\x1b[1m',
};
const header = (m) => console.log(`\n${c.cyan}${c.bold}${m}${c.reset}`);
const ok = (m) => console.log(`  ${c.green}[OK]${c.reset} ${m}`);
const warn = (m) => console.log(`  ${c.yellow}[!!]${c.reset} ${m}`);
const err = (m) => console.log(`  ${c.red}[XX]${c.reset} ${m}`);
const info = (m) => console.log(`       ${c.gray}${m}${c.reset}`);

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Executa um comando de forma síncrona (para etapas de setup). Aborta em erro.
function run(cmd, args, cwd, label) {
  info(`${label}: ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: IS_WIN });
  if (res.status !== 0) {
    err(`Falha ao executar: ${cmd} ${args.join(' ')} (em ${cwd})`);
    process.exit(1);
  }
}

// Sobe um processo de longa duração com prefixo nos logs.
function startProcess(cmd, args, cwd, name, color) {
  const child = spawn(cmd, args, { cwd, shell: IS_WIN });
  children.push(child);

  const prefix = `${color}[${name}]${c.reset}`;
  const pipe = (stream, isErr) => {
    stream.on('data', (data) => {
      data.toString().split('\n').forEach((line) => {
        if (line.trim()) console.log(`${prefix} ${isErr ? c.red : ''}${line}${c.reset}`);
      });
    });
  };
  pipe(child.stdout, false);
  pipe(child.stderr, true);

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      err(`Processo [${name}] encerrou com código ${code}.`);
    }
  });

  return child;
}

// Faz polling em uma URL HTTP até responder ou estourar o timeout.
function waitForHttp(url, timeoutMs = 30000, intervalMs = 600) {
  return new Promise((resolve) => {
    const start = Date.now();
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) return resolve(true);
        retry();
      });
      req.on('error', retry);
      req.setTimeout(2000, () => { req.destroy(); retry(); });
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs) return resolve(false);
      setTimeout(attempt, intervalMs);
    };
    attempt();
  });
}

// Encerramento limpo de todos os processos filhos.
let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  header('Encerrando...');
  try {
    const ngrok = require('@ngrok/ngrok');
    await ngrok.disconnect();
    await ngrok.kill();
  } catch { /* ngrok pode não estar ativo */ }
  for (const child of children) {
    if (child && !child.killed) {
      try {
        if (IS_WIN) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);
        else child.kill('SIGTERM');
      } catch { /* ignore */ }
    }
  }
  ok('Tudo encerrado. Até logo!');
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// =============================================================================
// Fluxo principal
// =============================================================================
async function main() {
  console.log(`${c.cyan}${c.bold}`);
  console.log('==============================================================');
  console.log('   ConectaBem — Inicializador Automático');
  console.log('==============================================================');
  console.log(c.reset);

  // ─── 1. Node.js ──────────────────────────────────────────────────────────
  header('1/7  Verificando Node.js...');
  ok(`Node ${process.version}`);

  // ─── 2. Arquivos .env ────────────────────────────────────────────────────
  header('2/7  Verificando arquivos .env...');
  let criouEnv = false;

  const ensureEnv = (dir, label) => {
    const envPath = path.join(dir, '.env');
    const examplePath = path.join(dir, '.env.example');
    if (!fs.existsSync(envPath)) {
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        warn(`${label}/.env criado a partir do .env.example`);
        criouEnv = true;
      } else {
        warn(`${label}/.env.example não encontrado — pulei.`);
      }
    } else {
      ok(`${label}/.env encontrado`);
    }
  };
  ensureEnv(BACKEND, 'backend');
  ensureEnv(FRONTEND, 'frontend');

  if (criouEnv) {
    console.log('');
    warn('Arquivos .env foram criados agora. Preencha as credenciais antes de continuar:');
    info('• backend/.env  → DATABASE_URL, DIRECT_URL, JWT_SECRET, NGROK_AUTHTOKEN');
    console.log('');
    err('Edite o(s) arquivo(s) .env e rode "npm start" novamente.');
    process.exit(0);
  }

  // ─── 3. Dependências ─────────────────────────────────────────────────────
  header('3/7  Verificando dependências...');
  const ensureDeps = (dir, label) => {
    if (!fs.existsSync(path.join(dir, 'node_modules'))) {
      warn(`Instalando dependências (${label})...`);
      run(NPM, ['install'], dir, label);
      ok(`${label}: dependências instaladas`);
    } else {
      ok(`${label}: node_modules OK`);
    }
  };
  ensureDeps(ROOT, 'raiz');
  ensureDeps(BACKEND, 'backend');
  ensureDeps(FRONTEND, 'frontend');

  // ─── 4. Prisma ───────────────────────────────────────────────────────────
  header('4/7  Preparando banco de dados (Prisma)...');
  run(NPX, ['prisma', 'generate'], BACKEND, 'prisma generate');
  ok('Prisma Client gerado');
  run(NPX, ['prisma', 'migrate', 'deploy'], BACKEND, 'prisma migrate deploy');
  ok('Migrations aplicadas');
  if (DO_SEED) {
    run('node', ['prisma/seed.js'], BACKEND, 'seed');
    ok('Banco populado (seed)');
  }

  // ─── 5. Backend ──────────────────────────────────────────────────────────
  header('5/7  Iniciando backend (porta 3001)...');
  startProcess(NPM, ['start'], BACKEND, 'backend', c.blue);
  info('Aguardando backend ficar saudável...');
  const backendOk = await waitForHttp(`http://localhost:${BACKEND_PORT}/api/health`, 30000);
  if (!backendOk) {
    err('Backend não respondeu no health check. Verifique as credenciais em backend/.env.');
    await shutdown();
    return;
  }
  ok(`Backend saudável em http://localhost:${BACKEND_PORT}`);

  // ─── 6. Frontend ─────────────────────────────────────────────────────────
  header('6/7  Iniciando frontend Vite (porta 5173)...');
  startProcess(NPM, ['run', 'dev'], FRONTEND, 'frontend', c.green);
  info('Aguardando Vite ficar pronto...');
  const frontOk = await waitForHttp(`http://localhost:${FRONTEND_PORT}`, 40000);
  if (frontOk) ok(`Frontend pronto em http://localhost:${FRONTEND_PORT}`);
  else warn('Vite demorou para responder — continuando mesmo assim.');

  // ─── 7. NGROK ────────────────────────────────────────────────────────────
  let publicUrl = null;
  if (NO_NGROK) {
    header('7/7  NGROK desativado (--no-ngrok). Rodando apenas localmente.');
  } else {
    header('7/7  Abrindo túnel NGROK...');
    require('dotenv').config({ path: path.join(BACKEND, '.env') });
    const token = process.env.NGROK_AUTHTOKEN;

    if (!token) {
      warn('NGROK_AUTHTOKEN não definido em backend/.env — pulando o túnel.');
      info('Obtenha seu token grátis em: https://dashboard.ngrok.com/get-started/your-authtoken');
      info('Adicione em backend/.env:  NGROK_AUTHTOKEN="seu_token"');
    } else {
      try {
        const ngrok = require('@ngrok/ngrok');
        const listener = await ngrok.connect({
          addr: FRONTEND_PORT,
          authtoken: token,
        });
        publicUrl = listener.url();
        ok('NGROK ativo!');
      } catch (e) {
        err(`Falha ao abrir o túnel NGROK: ${e.message}`);
        info('Verifique se o NGROK_AUTHTOKEN é válido e se não há outra sessão ativa.');
      }
    }
  }

  // ─── Resumo ──────────────────────────────────────────────────────────────
  console.log(`\n${c.cyan}${c.bold}==============================================================${c.reset}`);
  console.log(`${c.bold}   ConectaBem — Rodando!${c.reset}`);
  console.log(`${c.cyan}${c.bold}==============================================================${c.reset}`);
  if (publicUrl) {
    console.log(`  URL Pública (NGROK): ${c.green}${c.bold}${publicUrl}${c.reset}`);
  }
  console.log(`  Backend  (local):    ${c.gray}http://localhost:${BACKEND_PORT}${c.reset}`);
  console.log(`  Frontend (local):    ${c.gray}http://localhost:${FRONTEND_PORT}${c.reset}`);
  console.log(`${c.cyan}${c.bold}==============================================================${c.reset}`);
  console.log(`  ${c.gray}Pressione Ctrl+C para encerrar tudo.${c.reset}\n`);
}

main().catch(async (e) => {
  err(`Erro inesperado: ${e.message}`);
  console.error(e);
  await shutdown();
});
