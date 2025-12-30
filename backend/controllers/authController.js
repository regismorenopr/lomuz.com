
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { enviarEmailBoasVindas } = require('../services/emailService');
const db = require('../db'); // Acesso direto para inserts complexos se precisar

// --- UTILITÁRIOS ---

async function gerarIdCliente() {
  const anoAtual = new Date().getFullYear();
  const prefixo = `CLI-${anoAtual}-`;

  const ultimoUsuario = await Usuario.findOne({
    where: {
      id_publico: { [Op.like]: `${prefixo}%` }
    },
    order: [['created_at', 'DESC']]
  });

  let sequencial = 1;
  if (ultimoUsuario && ultimoUsuario.id_publico) {
    const partes = ultimoUsuario.id_publico.split('-');
    const numero = parseInt(partes[2]); 
    if (!isNaN(numero)) sequencial = numero + 1;
  }
  return `${prefixo}${String(sequencial).padStart(6, '0')}`;
}

function gerarSenhaForte() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!%";
  let senha = "";
  for (let i = 0; i < 8; i++) {
    senha += chars[Math.floor(Math.random() * chars.length)];
  }
  return senha;
}

// --- CONTROLLERS ---

exports.cadastroCliente = async (req, res) => {
  try {
    const { fullName, email, companyName, phone, acceptedTerms } = req.body;

    if (!acceptedTerms) return res.status(400).json({ error: "É necessário aceitar os termos." });

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(400).json({ error: "E-mail já cadastrado." });

    // 1. Criar Empresa (Tenant)
    const companyRes = await db.query(
        "INSERT INTO companies (company_name) VALUES ($1) RETURNING id",
        [companyName || 'Nova Empresa']
    );
    const companyId = companyRes.rows[0].id;

    // 2. Criar Usuário
    const id_publico = await gerarIdCliente();
    const senhaPlana = gerarSenhaForte();
    const password_hash = await bcrypt.hash(senhaPlana, 10);

    const novoUsuario = await Usuario.create({
      role: 'CLIENT',
      id_publico,
      name: fullName,
      email,
      company_id: companyId,
      telefone: phone,
      password_hash,
      active: true
    });

    enviarEmailBoasVindas(novoUsuario, senhaPlana);

    res.status(201).json({ message: "Cadastro realizado!", id: id_publico });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

exports.registerUserInternal = async (req, res) => {
    try {
        const { name, email, password, role, company } = req.body;

        const existe = await Usuario.findOne({ where: { email } });
        if (existe) return res.status(400).json({ error: "E-mail já cadastrado." });

        // Resolve Company
        let companyId = null;
        if (company) {
             const companyRes = await db.query("INSERT INTO companies (company_name) VALUES ($1) RETURNING id", [company]);
             companyId = companyRes.rows[0].id;
        }

        const id_publico = role === 'CLIENT' ? await gerarIdCliente() : null;
        const password_hash = await bcrypt.hash(password, 10);

        await Usuario.create({
            role: role === 'DIRECTOR' ? 'DIRECTOR' : 'CLIENT',
            id_publico,
            name: name,
            email,
            company_id: companyId,
            password_hash,
            active: true
        });
        
        res.status(201).json({ message: "Usuário criado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno ao criar usuário." });
    }
};

exports.login = async (req, res) => {
  try {
    const { login, senha, tipo } = req.body; 
    
    // Mapeamento de Role Frontend -> Backend
    const targetRole = tipo === 'diretor' ? 'DIRECTOR' : 'CLIENT';

    const usuario = await Usuario.findOne({
      where: {
        role: targetRole,
        active: true,
        [Op.or]: [
          { email: login },
          { id_publico: login }
        ]
      }
    });

    if (!usuario) return res.status(401).json({ error: "Credenciais inválidas." });

    const senhaValida = await bcrypt.compare(senha, usuario.password_hash);
    if (!senhaValida) return res.status(401).json({ error: "Credenciais inválidas." });

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role, company_id: usuario.company_id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      user: { 
        id: usuario.id,
        name: usuario.name, 
        role: usuario.role,
        publicId: usuario.id_publico,
        email: usuario.email,
        company_id: usuario.company_id
      } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no login." });
  }
};
