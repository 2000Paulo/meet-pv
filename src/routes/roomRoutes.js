// src/routes/roomRoutes.js
import express from 'express';
import { createRoom, getRooms, joinRoom, deleteRoom, getRoomDetails } from '../controllers/roomController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Altere para usar import

const router = express.Router();

// Rota para criar sala
router.post('/', authMiddleware, createRoom);

// Rota para listar salas
router.get('/', authMiddleware, getRooms);

// Rota para entrar em uma sala (Join)
router.post('/join', authMiddleware, joinRoom);

// Rota para excluir uma sala
router.delete('/:id', authMiddleware, deleteRoom);

// Rota para obter detalhes de uma sala
router.get('/:id', authMiddleware, getRoomDetails);

export default router;
