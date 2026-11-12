const mongoose = require('mongoose');

const tecnologiaSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: [true, 'O nome é obrigatório.'],
            unique: true,
            trim: true,
        },
        base: {
            type: String,
            required: [true, 'A base é obrigatória.'],
            enum: {
                values: ['PHP', 'C#', 'JS'],
                message: 'A base deve ser PHP, C# ou JS.',
            },
        },
        curvaAprendizado: {
            type: Number,
            required: [true, 'A curva de aprendizado é obrigatória.'],
            min: [1, 'A curva de aprendizado deve ser de pelo menos 1 mês.'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Tecnologia', tecnologiaSchema);
