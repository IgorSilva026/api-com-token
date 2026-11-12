const mongoose = require('mongoose');


function validarId(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }
    next();
}

module.exports = validarId;
