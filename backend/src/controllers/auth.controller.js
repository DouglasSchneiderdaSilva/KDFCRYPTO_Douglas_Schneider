const db = require('../database/connection');
const argon2 = require('argon2');


exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    
    if (!nome || nome.length < 3) {
      return res.status(400).json({ message: 'Nome deve ter no mínimo 3 caracteres' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Email inválido' });
    }

    if (!senha || senha.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
    }

    
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Erro no servidor', error: err });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      // Gerar hash Argon2
      const hash = await argon2.hash(senha, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, 
        timeCost: 3,
        parallelism: 1
      });

      
      const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
      db.query(query, [nome, email, hash], (err, result) => {
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


exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Erro no servidor', error: err });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      const user = results[0];

    
      const senhaCorreta = await argon2.verify(user.senha, senha);

      if (!senhaCorreta) {
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

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
