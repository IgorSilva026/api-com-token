const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const router = express.Router();

const TAMANHO_MINIMO_SENHA = 6;

// POST /auth/registrar - cria um usuário com a senha criptografada
router.post('/registrar', async (req, res) => {
    try {
        const { usuario, senha } = req.body;

        if (typeof usuario !== 'string' || typeof senha !== 'string' || !usuario.trim() || !senha) {
            return res.status(400).json({ mensagem: 'Os campos usuario e senha são obrigatórios.' });
        }

        if (senha.length < TAMANHO_MINIMO_SENHA) {
            return res.status(400).json({
                mensagem: `A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`,
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const novoUsuario = await Usuario.create({ usuario, senha: senhaCriptografada });

        res.status(201).json({
            mensagem: 'Usuário criado com sucesso.',
            usuario: { _id: novoUsuario._id, usuario: novoUsuario.usuario },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ mensagem: 'Dados inválidos.', erro: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ mensagem: 'Esse nome de usuário já existe.' });
        }
        res.status(500).json({ mensagem: 'Erro ao criar usuário.', erro: error.message });
    }
});

// POST /auth/login - confere usuário e senha e devolve o token JWT
router.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;

        if (typeof usuario !== 'string' || typeof senha !== 'string' || !usuario.trim() || !senha) {
            return res.status(400).json({ mensagem: 'Os campos usuario e senha são obrigatórios.' });
        }

        // +senha traz o hash, que normalmente fica oculto (select: false)
        const encontrado = await Usuario.findOne({ usuario: usuario.trim().toLowerCase() }).select('+senha');
        const senhaCorreta = encontrado && (await bcrypt.compare(senha, encontrado.senha));

        // Mesma mensagem nos dois casos, para não revelar se o usuário existe
        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
        }

        const token = jwt.sign(
            { id: encontrado._id, usuario: encontrado.usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao fazer login.', erro: error.message });
    }
});

module.exports = router;
