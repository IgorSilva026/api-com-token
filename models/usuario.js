const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
    {
        usuario: {
            type: String,
            required: [true, 'O usuário é obrigatório.'],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, 'O usuário deve ter pelo menos 3 caracteres.'],
        },

        senha: {
            type: String,
            required: [true, 'A senha é obrigatória.'],
            select: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Usuario', usuarioSchema);
