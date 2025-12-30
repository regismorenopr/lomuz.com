
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Mapeia a tabela 'users' criada via SQL Raw para compatibilidade
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role: {
    type: DataTypes.STRING, // 'DIRECTOR', 'CLIENT'
    defaultValue: 'CLIENT',
  },
  id_publico: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true, 
  },
  name: { // Alterado de nome_completo para name
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  // Mapeamento virtual para manter compatibilidade com código legado se necessário
  empresa: {
    type: DataTypes.VIRTUAL,
    get() { return 'Minha Empresa'; } // Simplificação, real data is in company_id link
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password_hash: { // Alterado de senha_hash para password_hash
    type: DataTypes.STRING,
    allowNull: false,
  },
  active: { // Alterado de ativo
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'users', // Aponta para a tabela correta do SQL
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Usuario;
