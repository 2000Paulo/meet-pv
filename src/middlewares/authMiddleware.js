import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // Certifique-se de que o JWT_SECRET está carregado corretamente

const authMiddleware = (req, res, next) => {
    console.log('Autenticando...');

    // Extrair o token do cabeçalho Authorization
    const token = req.headers['authorization']?.split(' ')[1];

    // Verifica se o token foi fornecido
    if (!token) {
        return res.status(403).json({ error: 'Token não fornecido.' });
    }

    // Verifica o token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token inválido:', err);
            return res.status(401).json({ error: 'Token inválido.' });
        }

        // Adiciona o ID do usuário ao objeto da requisição
        req.userId = decoded.id; // Ajuste aqui se o campo do ID for diferente
        next(); // Chama o próximo middleware
    });
};

// Exporta o middleware
export default authMiddleware;
