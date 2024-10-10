// src/controllers/tokenController.js
import jwt from 'jsonwebtoken'; // Importa o jwt com a sintaxe de módulos ES

// Função para gerar e enviar um token
export const getToken = (req, res) => {
    // Aqui você pode obter o userId de onde for necessário (por exemplo, após o login)
    const userId = req.userId; // Certifique-se de que o userId esteja disponível na requisição

    // Gera o token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Retorna o token como resposta
    res.json({ token });
};
