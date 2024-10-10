// socketServer.js
const usersInRoom = {};

function socketServer(io) {
    io.on('connection', (socket) => {
        console.log('Novo cliente conectado:', socket.id);

        // Quando um usuário entra em uma sala
        socket.on('joinRoom', ({ roomId, userId }) => {
            if (!usersInRoom[roomId]) {
                usersInRoom[roomId] = [];
            }
        
            // Verifica se o usuário já está na sala
            if (!usersInRoom[roomId].includes(userId)) {
                socket.join(roomId);
                socket.userId = userId; // Armazena o userId no socket
                usersInRoom[roomId].push(userId);
                console.log(`${userId} entrou na sala ${roomId}`);
        
                io.to(roomId).emit('userJoined', { userId, roomId });
            } else {
                console.log(`Usuário ${userId} já está na sala ${roomId}`);
                io.to(socket.id).emit('error', { message: 'Usuário já está na sala.' });
            }
        });

        // Receber mensagem de chat e enviar para os participantes da sala
        socket.on('sendMessage', ({ roomId, message }) => {
            io.to(roomId).emit('receiveMessage', message);
        });

        // Eventos para chamada de vídeo/áudio
        socket.on('callUser', (data) => {
            io.to(data.to).emit('callMade', {
                signal: data.signal,
                from: data.from,
                name: data.name
            });
        });

        socket.on('answerCall', (data) => {
            io.to(data.to).emit('callAnswered', data.signal);
        });

        // Quando um usuário sai da sala
        socket.on('leaveRoom', ({ roomId, userId }) => {
            socket.leave(roomId);
            usersInRoom[roomId] = usersInRoom[roomId].filter(id => id !== userId);
            io.to(roomId).emit('userLeft', { userId });
        });

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        
            for (const roomId in usersInRoom) {
                // Remover o userId ao invés do socket.id
                usersInRoom[roomId] = usersInRoom[roomId].filter(id => id !== socket.userId);
                
                // Emitir para todos os usuários na sala que alguém saiu
                io.to(roomId).emit('userLeft', { userId: socket.userId });
            }
        });
    });
}

export default socketServer;
