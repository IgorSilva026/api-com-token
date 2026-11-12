const express = require('express');
const Tecnologia = require('../models/tecnologia');
const verificarToken = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');

const router = express.Router();

// Todas as rotas deste arquivo exigem token válido
router.use(verificarToken);

// Converte o erro em uma resposta com o status HTTP correto
function responderErro(res, error, mensagem) {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ mensagem, erro: error.message });
    }
    if (error.code === 11000) {
        return res.status(409).json({ mensagem: 'Já existe uma tecnologia com esse nome.' });
    }
    res.status(500).json({ mensagem, erro: error.message });
}

function camposValidos({ nome, base, curvaAprendizado }) {
    return Boolean(nome && base && curvaAprendizado);
}

// GET /tecnologias - listar todas
router.get('/', async (req, res) => {
    try {
        const tecnologias = await Tecnologia.find().sort({ nome: 1 });
        res.status(200).json(tecnologias);
    } catch (error) {
        responderErro(res, error, 'Erro ao buscar tecnologias.');
    }
});

// GET /tecnologias/:id - buscar uma
router.get('/:id', validarId, async (req, res) => {
    try {
        const tecnologia = await Tecnologia.findById(req.params.id);

        if (!tecnologia) {
            return res.status(404).json({ mensagem: 'Tecnologia não encontrada.' });
        }

        res.status(200).json(tecnologia);
    } catch (error) {
        responderErro(res, error, 'Erro ao buscar tecnologia.');
    }
});

// POST /tecnologias - criar
router.post('/', async (req, res) => {
    try {
        const { nome, base, curvaAprendizado } = req.body;

        if (!camposValidos({ nome, base, curvaAprendizado })) {
            return res.status(400).json({
                mensagem: 'Os campos nome, base e curvaAprendizado são obrigatórios.',
            });
        }

        const novaTecnologia = await Tecnologia.create({ nome, base, curvaAprendizado });
        res.status(201).json(novaTecnologia);
    } catch (error) {
        responderErro(res, error, 'Erro ao cadastrar tecnologia.');
    }
});

// PUT /tecnologias/:id - atualizar
router.put('/:id', validarId, async (req, res) => {
    try {
        const { nome, base, curvaAprendizado } = req.body;

        if (!camposValidos({ nome, base, curvaAprendizado })) {
            return res.status(400).json({
                mensagem: 'Os campos nome, base e curvaAprendizado são obrigatórios.',
            });
        }

        const tecnologiaAtualizada = await Tecnologia.findByIdAndUpdate(
            req.params.id,
            { nome, base, curvaAprendizado },
            { new: true, runValidators: true }
        );

        if (!tecnologiaAtualizada) {
            return res.status(404).json({ mensagem: 'Tecnologia não encontrada.' });
        }

        res.status(200).json(tecnologiaAtualizada);
    } catch (error) {
        responderErro(res, error, 'Erro ao atualizar tecnologia.');
    }
});

// DELETE /tecnologias/:id - remover
router.delete('/:id', validarId, async (req, res) => {
    try {
        const tecnologiaRemovida = await Tecnologia.findByIdAndDelete(req.params.id);

        if (!tecnologiaRemovida) {
            return res.status(404).json({ mensagem: 'Tecnologia não encontrada.' });
        }

        res.status(200).json({ mensagem: 'Tecnologia removida com sucesso.' });
    } catch (error) {
        responderErro(res, error, 'Erro ao remover tecnologia.');
    }
});

module.exports = router;
