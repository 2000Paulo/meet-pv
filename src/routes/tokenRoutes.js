// src/routes/tokenRoutes.js
import express from 'express';
import { getToken } from '../controllers/tokenController.js'; // Importa a função getToken do controller

const router = express.Router();

// Rota para enviar o token ao frontend
router.get('/get-token', getToken); // Chama a função getToken sem middleware de autenticação

export default router; // Exporte o roteador
