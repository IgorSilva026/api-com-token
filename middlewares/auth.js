const jwt = require('jsonwebtoken');


function verificarToken(req, res, next) {
    const cabecalho = req.headers.authorization;

    if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
        return res.status(401).json({ mensagem: 'Token não informado.' });
    }

    const token = cabecalho.split(' ')[1];

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
    }
}

module.exports = verificarToken;
