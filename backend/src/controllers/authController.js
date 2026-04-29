// ============================================================================
// ConectaBem — Controller de Autenticação
// ============================================================================
// Responsável por:
//   • Registro de novos usuários (hash da senha com bcrypt)
//   • Login com validação de credenciais e geração de JWT
//   • Consulta dos dados do usuário logado (rota /me)
// ============================================================================

const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Número de rounds do bcrypt — 12 oferece bom equilíbrio entre segurança e performance
const BCRYPT_SALT_ROUNDS = 12;

// Tempo de expiração do token JWT (7 dias)
const JWT_EXPIRATION = '7d';

// ─── Registro ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 *
 * Cria um novo usuário na plataforma.
 *
 * Body esperado:
 *   {
 *     "nome": "Maria Silva",
 *     "email": "maria@email.com",
 *     "senha": "minhasenha123",
 *     "tipo": "doador"           // opcional, default = "doador"
 *   }
 *
 * Respostas:
 *   201 — Usuário criado com sucesso + token JWT
 *   400 — Campos obrigatórios ausentes
 *   409 — Email já cadastrado
 *   500 — Erro interno
 */
async function register(req, res) {
  try {
    const { nome, email, senha, role, cnpj, descricaoInstituicao, telefone, endereco } = req.body;

    // ── Validação de campos obrigatórios ──
    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Os campos nome, email e senha são obrigatórios.',
      });
    }

    // ── Validação de tipo de usuário ──
    const rolesPermitidas = ['USER', 'INSTITUTION', 'ADMIN'];
    const roleUsuario = role || 'USER';

    if (!rolesPermitidas.includes(roleUsuario)) {
      return res.status(400).json({
        erro: `Role inválida. Use: ${rolesPermitidas.join(', ')}`,
      });
    }

    // ── Verifica se o email já está em uso ──
    const emailExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExistente) {
      return res.status(409).json({
        erro: 'Este email já está cadastrado.',
      });
    }

    // ── Verifica se o CPF/CNPJ já está em uso ──
    if (cnpj) {
      const cnpjNumerico = cnpj.replace(/\D/g, '');
      const cnpjExistente = await prisma.user.findUnique({
        where: { cnpj: cnpjNumerico },
      });

      if (cnpjExistente) {
        return res.status(409).json({
          erro: 'Este CPF/CNPJ já está cadastrado em outra conta.',
        });
      }
    }

    // ── Hash da senha com bcrypt ──
    const senhaHash = await bcrypt.hash(senha, BCRYPT_SALT_ROUNDS);

    // ── Definição de Status baseada na Role ──
    const statusInicial = roleUsuario === 'INSTITUTION' ? 'PENDING' : 'APPROVED';

    // ── Criação do usuário no banco ──
    const novoUsuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        role: roleUsuario,
        status: statusInicial,
        cnpj: cnpj || null,
        descricaoInstituicao: roleUsuario === 'INSTITUTION' ? descricaoInstituicao : null,
        telefone: roleUsuario === 'INSTITUTION' ? telefone : null,
        endereco: roleUsuario === 'INSTITUTION' ? endereco : null,
      },
    });

    // ── Gera token JWT para login automático após cadastro ──
    const token = jwt.sign(
      { id: novoUsuario.id, email: novoUsuario.email, role: novoUsuario.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // ── Resposta de sucesso (sem expor a senha) ──
    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      token,
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role: novoUsuario.role,
        status: novoUsuario.status,
        pontos: novoUsuario.pontos,
      },
    });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    return res.status(500).json({ erro: 'Erro interno ao registrar usuário.' });
  }
}

// ─── Login ──────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 *
 * Autentica o usuário e retorna um token JWT.
 *
 * Body esperado:
 *   {
 *     "email": "maria@email.com",
 *     "senha": "minhasenha123"
 *   }
 *
 * Respostas:
 *   200 — Login bem-sucedido + token JWT
 *   400 — Campos obrigatórios ausentes
 *   401 — Credenciais inválidas
 *   500 — Erro interno
 */
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    // ── Validação de campos obrigatórios ──
    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Os campos email e senha são obrigatórios.',
      });
    }

    // ── Busca o usuário pelo email ──
    const usuario = await prisma.user.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: 'E-mail não encontrado na base de dados.',
      });
    }

    // ── Compara a senha fornecida com o hash armazenado ──
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Email ou senha incorretos.',
      });
    }

    // ── Verificação de Status ──
    if (usuario.status === 'REJECTED') {
      return res.status(403).json({ 
        erro: 'Sua conta foi recusada', 
        motivo: usuario.rejectionReason || 'Sem detalhes fornecidos. Entre em contato com o suporte.'
      });
    }

    // Se for INSTITUTION PENDING, também não pode logar
    if (usuario.role === 'INSTITUTION' && usuario.status === 'PENDING') {
      return res.status(403).json({
        erro: 'Sua conta ainda está em análise pelo administrador.'
      });
    }

    // ── Gera token JWT ──
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // ── Resposta conforme especificado no README ──
    return res.json({
      token,
      nome: usuario.nome,
      pontos: usuario.pontos,
      role: usuario.role,
      status: usuario.status,
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return res.status(500).json({ erro: 'Erro interno ao fazer login.' });
  }
}

// ─── Dados do Usuário Logado ────────────────────────────────────────────────

/**
 * GET /api/auth/me
 *
 * Retorna os dados do usuário autenticado (requer JWT).
 * O middleware authMiddleware já decodificou o token e populou `req.user`.
 *
 * Respostas:
 *   200 — Dados do usuário
 *   404 — Usuário não encontrado (token válido mas usuário deletado)
 *   500 — Erro interno
 */
async function me(req, res) {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        pontos: true,
        avatar: true,
        cnpj: true,
        descricaoInstituicao: true,
        necessidadesUrgentes: true,
        telefone: true,
        endereco: true,
        criadoEm: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.json(usuario);
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar dados do usuário.' });
  }
}

// ─── Atualização de Perfil ───────────────────────────────────────────────────
async function updateProfile(req, res) {
  try {
    const { nome, telefone, endereco, descricaoInstituicao, necessidadesUrgentes } = req.body;
    const userId = req.user.id;

    const usuarioAtualizado = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(nome                 !== undefined && { nome }),
        ...(telefone             !== undefined && { telefone }),
        ...(endereco             !== undefined && { endereco }),
        ...(descricaoInstituicao !== undefined && { descricaoInstituicao }),
        ...(necessidadesUrgentes !== undefined && { necessidadesUrgentes }),
      },
      select: {
        id:                   true,
        nome:                 true,
        email:                true,
        telefone:             true,
        endereco:             true,
        cnpj:                 true,
        descricaoInstituicao: true,
        necessidadesUrgentes: true,
      },
    });

    return res.json({
      mensagem: 'Perfil atualizado com sucesso!',
      user: usuarioAtualizado,
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    return res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
  }
}

// ─── Listar Instituições Aprovadas (Público/Doador) ───────────────
async function getApprovedInstitutions(req, res) {
  try {
    const instituicoes = await prisma.user.findMany({
      where: {
        role: 'INSTITUTION',
        status: 'APPROVED',
      },
      select: {
        id: true,
        nome: true,
        descricaoInstituicao: true,
        necessidadesUrgentes: true,
      },
      orderBy: {
        nome: 'asc'
      }
    });
    return res.json(instituicoes);
  } catch (error) {
    console.error('❌ Erro ao listar ONGs aprovadas:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar ONGs.' });
  }
}

module.exports = { register, login, me, updateProfile, getApprovedInstitutions };
