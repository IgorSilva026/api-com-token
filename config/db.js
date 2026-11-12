const mongoose = require('mongoose');

async function connectDatabase() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Banco de dados conectado com sucesso!');
}

module.exports = connectDatabase;
