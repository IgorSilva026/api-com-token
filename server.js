require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDatabase = require('./config/db');
const authRoutes = require('./routes/auth');
const tecnologiaRoutes = require('./routes/tecnologias');

const app = express();
const PORT = process.env.PORT || 1234;

if (!process.env.JWT_SECRET) {
    console.error('Defina JWT_SECRET no arquivo .env');
    process.exit(1);
}

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRoutes);               
app.use('/tecnologias', tecnologiaRoutes);  

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({ mensagem: 'JSON inválido no corpo da requisição.' });
    }
    next(error);
});

connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Erro ao conectar ao banco:', error.message);
    });

module.exports = app;
