import Room from '../models/Room.js'; // Importa o modelo Room
import jwt from 'jsonwebtoken'; // Importa o jwt para verificar tokens

const createRoom = async (req, res) => {
    const { name, capacity } = req.body; 
    const ownerId = req.userId; // Pega o ownerId do middleware de autenticação

    if (!name || !capacity) {
        return res.status(400).json({ error: 'Nome e capacidade são obrigatórios.' });
    }

    try {
        const room = await Room.create({
            name,
            capacity,
            ownerId,
        });

        return res.status(201).json(room);
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        return res.status(500).json({ error: 'Erro interno ao criar sala.' });
    }
};

const getRooms = async (req, res) => {
    const ownerId = req.userId;

    try {
        const rooms = await Room.findAll({
            where: { ownerId }
        });

        return res.status(200).json(rooms);
    } catch (error) {
        console.error('Erro ao listar salas:', error);
        return res.status(500).json({ error: 'Erro interno ao listar salas.' });
    }
};

// Middleware para verificar o token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extrai o token do header
    console.log('Token recebido:', token);
    if (!token) {
        return res.status(403).json({ error: 'Token não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token inválido:', err);
            return res.status(401).json({ error: 'Token inválido.' });
        }
        req.userId = decoded.id; // Adiciona o userId ao objeto da requisição
        next(); // Chama o próximo middleware
    });
};

const joinRoom = async (req, res) => {
    console.log('Requisição recebida:', req.body);
    const { roomId } = req.body;
    const userId = req.userId;

    try {
        const room = await Room.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }

        // Adiciona o participante usando o método definido no modelo
        await room.addParticipant(userId);

        res.status(200).json({ message: 'Entrou na sala com sucesso', room });
    } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        res.status(500).json({ message: 'Erro ao entrar na sala' });
    }
};

// Função para excluir uma sala
// roomController.js
const deleteRoom = async (req, res) => {
    const roomId = req.params.id;
    try {
        const result = await Room.destroy({ where: { id: roomId } });
        if (result) {
            return res.status(200).json({ message: 'Sala excluída com sucesso!' });
        } else {
            return res.status(404).json({ message: 'Sala não encontrada.' });
        }
    } catch (error) {
        console.error('Erro ao excluir a sala:', error);
        return res.status(500).json({ message: 'Erro ao excluir a sala.' });
    }
};


const getRoomDetails = async (req, res) => {
    try {
        const room = await Room.findByPk(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }
        res.json(room);
    } catch (error) {
        console.error('Erro ao buscar sala:', error);
        res.status(500).json({ message: 'Erro ao buscar sala' });
    }
};

export {
    createRoom,
    getRooms,
    joinRoom,
    deleteRoom,
    verifyToken,
    getRoomDetails
};
