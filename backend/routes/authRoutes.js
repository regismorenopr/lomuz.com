
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validationMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/register', validate(schemas.register), authController.cadastroCliente);
router.post('/login', validate(schemas.login), authController.login);
// Rota para o diretor criar usuários (Idealmente, adicionar middleware de autenticação aqui)
router.post('/register-internal', authController.registerUserInternal);

// Session check
router.get('/me', requireAuth, (req, res) => {
    res.json(req.user);
});

module.exports = router;
