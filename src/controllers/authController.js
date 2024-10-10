import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const { JWT_SECRET } = process.env;

// Função para gerar um token
const generateToken = (userId) => {
    const payload = { id: userId };
    const options = { expiresIn: '1h' }; // O token expira em 1 hora
    return jwt.sign(payload, JWT_SECRET, options);
};

// Função para registrar usuário
const register = async (req, res) => {
    const { name, email, password } = req.body; // Certifique-se de que os campos estão corretos

    // Validação simples
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    try {
        // Verifique se o usuário já existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Usuário já existe.' });
        }

        // Hash a senha antes de armazenar
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crie um novo usuário
        const newUser = await User.create({
            username: name, // Usa o campo correto para o nome de usuário
            email,          // Usa o campo correto para o email
            password: hashedPassword // Usa a senha hasheada
        });

        return res.status(201).json({
            message: 'Usuário registrado com sucesso.',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        return res.status(500).json({ error: 'Erro ao registrar usuário.' }); // Erro interno do servidor
    }
};

// Função para fazer login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Email ou senha incorretos.' });
        }

        const token = generateToken(user.id);
        res.json({ token });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro ao fazer login.' }); // Erro interno do servidor
    }
};
console.log('JWT_SECRET:', JWT_SECRET);
export default { generateToken, register, login };
