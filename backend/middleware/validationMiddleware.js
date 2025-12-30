
const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join('; ');
    return res.status(400).json({ error: errorMessage });
  }
  next();
};

const schemas = {
  // Auth
  login: Joi.object({
    login: Joi.string().required().messages({'any.required': 'Login é obrigatório'}),
    senha: Joi.string().required().messages({'any.required': 'Senha é obrigatória'}),
    tipo: Joi.string().valid('diretor', 'cliente').required()
  }),
  register: Joi.object({
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).optional(),
    companyName: Joi.string().optional(),
    phone: Joi.string().optional(),
    acceptedTerms: Joi.boolean().valid(true).required().messages({'any.only': 'Você deve aceitar os termos.'})
  }),
  // Streams
  createStream: Joi.object({
    name: Joi.string().min(3).required(),
    companyId: Joi.string().uuid().optional()
  }),
  // Billing
  activatePlan: Joi.object({
    stream_id: Joi.string().uuid().required(),
    plan_code: Joi.string().required(),
    contracted_accesses: Joi.number().integer().min(1).required(),
    currency: Joi.string().length(3).default('BRL'),
    price_cents: Joi.number().integer().min(0).required(),
    gateway: Joi.string().valid('INTERNAL', 'STRIPE', 'ASAAS').required()
  })
};

module.exports = { validate, schemas };
