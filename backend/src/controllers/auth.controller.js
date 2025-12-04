const db = require('../database/connection');

// Registro de usuário
exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validações
    if (!nome || nome.length < 3) {
      return res.status(400).json({ message: 'Nome deve ter no mínimo 3 caracteres' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Email inválido' });
    }

    if (!senha || senha.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Verificar se email já existe
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Erro no servidor', error: err });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      // Inserir usuário no banco (senha em texto plano)
      const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
      db.query(query, [nome, email, senha], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Erro ao cadastrar usuário', error: err });
        }

        res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário no banco
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Erro no servidor', error: err });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      const user = results[0];

      // Comparar senha diretamente
      if (senha !== user.senha) {
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      // Retornar dados sem token
      res.json({
        message: 'Login efetuado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error });
  }
};