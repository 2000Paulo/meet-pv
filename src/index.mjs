// Importações
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as socketIO } from 'socket.io';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import socketServer from './socketServer.js';
import sequelize from './config/database.js';
import authMiddleware from './middlewares/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Configuração do CORS
app.use(cors({
    origin: '*', // Ou especifique sua origem, por exemplo: 'http://127.0.0.1:5500'
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'], // Adicione todos os métodos que você precisa permitir
}));

// Middleware para JSON
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Rotas
app.use('/api/token', tokenRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', authMiddleware, roomRoutes);

// Rota raiz (teste)
app.get('/', (req, res) => res.send('API funcionando!'));

// Configuração do Swagger
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Meet API',
            version: '1.0.0',
            description: 'API para gerenciamento de reuniões',
        },
        servers: [{ url: 'http://localhost:3000' }],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Servidor HTTP e Socket.io
const server = http.createServer(app);
const io = new socketIO(server, {
    cors: {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Configuração do Socket.io
socketServer(io);

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida!');
        await sequelize.sync({ force: false });
        console.log('Tabelas sincronizadas!');
    } catch (error) {
        console.error('Não foi possível conectar ao banco de dados:', error.message);
    }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Algo deu errado!' });
});
