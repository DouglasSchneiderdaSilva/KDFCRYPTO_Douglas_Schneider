const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rota de registro
router.post('/register', authController.register);

// Rota de login
router.post('/login', authController.login);

module.exports = router;
