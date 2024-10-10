// src/routes/authRoutes.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { body, validationResult } from 'express-validator';
import authController from '../controllers/authController.js';
import Room from '../models/Room.js';
const router = express.Router();

router.post('/register', [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    // Chame a lógica de registro do seu controlador
    await authController.register(req, res);
});

router.post('/login', 
    body('email').isEmail(),
    body('password').exists(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        authController.login(req, res); // Chamar controlador
    }
);

router.delete('/api/rooms/:id', async (req, res) => {
    const roomId = req.params.id;
    try {
        const deletedCount = await Room.destroy({ where: { id: roomId } });
        if (deletedCount === 0) {
            return res.status(404).send('Sala não encontrada.'); // Sala não existe
        }
        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Erro ao excluir sala:', error);
        res.status(500).send('Erro ao excluir sala.');
    }
});

router.post('/api/rooms/join', authMiddleware, async (req, res) => {
    const { roomId } = req.body;

    // Verificar se roomId foi fornecido
    if (!roomId) {
        return res.status(400).json({ message: "ID da sala não fornecido." });
    }

    try {
        // Verificar se a sala existe no banco de dados
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Sala não encontrada." });
        }

        // Aqui você pode adicionar lógica para verificar se o usuário pode entrar na sala

        return res.status(200).json({ message: "Você entrou na sala com sucesso." });
    } catch (error) {
        console.error("Erro no servidor:", error); // Adicione um log detalhado do erro
        return res.status(500).json({ message: "Erro ao entrar na sala." });
    }
});

export default router;

