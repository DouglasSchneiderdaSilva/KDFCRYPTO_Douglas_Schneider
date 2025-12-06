const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());


app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' });
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});