function enterRoom(roomId) {
    // Redireciona para room.html passando o ID da sala na URL
    console.log('Room ID1:', roomId);
    window.location.href = `room.html?roomId=${roomId}`;
}

function getRoomIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('roomId'); // Verifica se o ID da sala está na URL
}

const getRoomDetails = async (req, res) => {
    const roomId = req.params.id; // O ID da sala deve vir da URL da rota

    try {
        const room = await Room.findByPk(roomId, {
            include: ['participants'], // Inclua participantes se necessário
        });

        if (!room) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }

        return res.status(200).json(room);
    } catch (error) {
        console.error('Erro ao buscar detalhes da sala:', error);
        return res.status(500).json({ message: 'Erro ao carregar detalhes da sala' });
    }
};

// Ao carregar o documento, obter o ID da sala da URL
document.addEventListener('DOMContentLoaded', async () => {
    const roomId = getRoomIdFromUrl(); // Obtendo roomId da URL
    console.log('Room ID from URL:', roomId); // Verifique o roomId

    const token = localStorage.getItem('authToken');

    if (!roomId) {
        alert('ID da sala não fornecido.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/rooms/${roomId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const room = await response.json();
            document.getElementById('roomName').textContent = room.name; 
            document.getElementById('roomCapacity').textContent = room.capacity; 
        } else {
            const errorData = await response.text();
            alert('Erro ao carregar os detalhes da sala: ' + (errorData || 'Erro desconhecido.'));
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes da sala:', error);
        alert('Erro ao carregar detalhes da sala: ' + error.message);
    }
});

// Inicializa o Socket.io
const socket = io('http://localhost:3000', {
    withCredentials: true
});

const roomId = getRoomIdFromUrl(); // Reobtemos o roomId aqui para uso no Socket
const userId = localStorage.getItem('userId'); 

if (userId) {
    console.log('User ID:', userId); // Verificando userId
    socket.emit('joinRoom', { roomId, userId });

    document.getElementById('chatForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const message = document.getElementById('chatInput').value;
        if (message) {
            socket.emit('sendMessage', { roomId, message });
            document.getElementById('chatInput').value = ''; 
        }
    });

    socket.on('receiveMessage', (message) => {
        const chatBox = document.getElementById('chatBox');
        const newMessage = document.createElement('div');
        newMessage.textContent = message;
        chatBox.appendChild(newMessage); 
    });
} else {
    console.log(localStorage.getItem('authToken'));
    console.log(localStorage.getItem('userId'));
    console.log(localStorage.getItem('roomId'));
    alert('Usuário não autenticado. Por favor, faça login para entrar na sala.');
}

// Para chamadas de vídeo/áudio, utilize as bibliotecas apropriadas (ex: PeerJS ou WebRTC)
