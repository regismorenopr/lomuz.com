
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan'); 
require('./db'); 
const sequelize = require('./config/db');
const schemaInit = require('./services/schemaInit');

// Routes
const playerRoutes = require('./routes/playerRoutes');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/v1/player', playerRoutes);

// INIT SEQUENCE
const startServer = async () => {
    try {
        await schemaInit.run();
        await sequelize.sync();

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor Lomuz ON na porta ${PORT}`);
        });

    } catch (e) {
        console.error("❌ Falha ao iniciar servidor:", e);
        process.exit(1);
    }
};

startServer();
