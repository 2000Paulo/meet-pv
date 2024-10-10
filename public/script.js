// Alternar visibilidade de botões de autenticação
// localStorage.removeItem('authToken');
function toggleAuthButtons(show) {
    const display = show ? 'inline' : 'none';
    document.getElementById('showLoginForm').style.display = display;
}

// Lidar com login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token); // Armazena o token JWT
                localStorage.setItem('userId', data.userId);   // Armazena o userId
                window.location.href = 'index.html'; // Redireciona para a página principal
            } else {
                const errorData = await response.text();
                alert('Falha ao fazer login: ' + (errorData || 'Erro desconhecido.'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao tentar se conectar ao servidor.');
        }
    });
}

// Lidar com registro
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (response.ok) {
                alert('Registro bem-sucedido! Faça login.');
                registerForm.reset(); // Limpa o formulário após o registro
                window.location.href = 'login.html'; // Redireciona para login
            } else {
                const errorData = await response.text();
                alert('Falha ao registrar: ' + (errorData || 'Erro desconhecido.'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao tentar se conectar ao servidor.');
        }
    });
}

// Lidar com logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken'); // Remove token
    localStorage.removeItem('userId');    // Remove userId
    window.location.href = 'login.html';  // Redireciona para login
});

// Função para excluir sala
async function deleteRoom(roomId, token, listItem) {
    if (confirm('Você tem certeza que deseja excluir esta sala?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/rooms/${roomId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                alert('Sala excluída com sucesso!');
                listItem.remove(); // Remove o item da lista
            } else {
                const errorData = await response.text();
                alert('Falha ao excluir sala: ' + (errorData || 'Erro desconhecido.'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao tentar se conectar ao servidor: ' + error.message);
        }
    }
}

// Função para entrar na sala
async function joinRoom(roomId) {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId'); // Certifique-se de que o userId é obtido

    if (!userId || !roomId) {
        alert('ID da sala ou do usuário não fornecido.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/rooms/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roomId, userId })
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message);
            window.location.href = `room.html?id=${roomId}`;
        } else {
            const errorData = await response.text();
            alert('Falha ao entrar na sala: ' + (errorData || 'Erro desconhecido.'));
        }
    } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        alert('Erro ao tentar se conectar ao servidor.');
    }
}

// Lidar com o clique do botão "Entrar"
document.getElementById('joinRoomButton')?.addEventListener('click', async () => {
    const roomIdInput = document.getElementById('roomId'); // Obter o campo de entrada do ID da sala
    const roomId = roomIdInput ? roomIdInput.value.trim() : ''; // Obter o valor e remover espaços em branco

    if (!roomId) {
        alert('ID da sala não fornecido.');
        return;
    }

    await joinRoom(roomId); // Chama a função de entrada na sala
});

// Lidar com carregamento de salas
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId'); // Obter userId armazenado
    const isLoginPage = window.location.pathname.includes('login.html');
    const isRegisterPage = window.location.pathname.includes('register.html');

    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id'); // Obtém o ID da sala da URL

    if (roomId) {
        await loadRoomDetails(roomId); // Chama a função para carregar os detalhes da sala
    }

    if (!token && !isLoginPage && !isRegisterPage) {
        window.location.href = 'login.html'; // Redirecionar para login
        return;
    }

    if (token && (isLoginPage || isRegisterPage)) {
        window.location.href = 'index.html'; // Redirecionar para home
        return;
    }

    if (token && window.location.pathname.includes('index.html')) {
        try {
            const response = await fetch('http://localhost:3000/api/rooms', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const rooms = await response.json();
                const roomsList = document.getElementById('roomsList');
                roomsList.innerHTML = '';

                rooms.forEach((room) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <strong>Nome:</strong> ${room.name}<br>
                        <strong>ID:</strong> ${room.id}<br>
                        <button onclick="joinRoom('${roomId}')">Entrar</button>
                        <button onclick="deleteRoom('${room.id}', '${token}', this.closest('li'))">Excluir</button>
                    `;
                    roomsList.appendChild(listItem);
                });
            } else {
                console.error('Falha ao carregar salas.');
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }
});

// Criar nova sala
const createRoomForm = document.getElementById('createRoomForm');
if (createRoomForm) {
    createRoomForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const roomName = document.getElementById('roomName').value;
        const roomCapacity = document.getElementById('roomCapacity').value; // Captura a capacidade da sala
        const token = localStorage.getItem('authToken');

        if (!token) {
            alert('Você precisa estar logado para criar uma sala.');
            return;
        }

        // Verifica se os campos estão preenchidos
        if (!roomName || !roomCapacity) {
            alert('Nome e capacidade são obrigatórios para criar uma sala.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/rooms', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: roomName, capacity: roomCapacity }) // Adiciona capacidade no corpo da requisição
            });

            if (response.ok) {
                alert('Sala criada com sucesso!');
                createRoomForm.reset(); // Limpa o formulário
                window.location.reload(); // Atualiza a lista de salas
            } else {
                const errorData = await response.text();
                alert('Falha ao criar sala: ' + (errorData || 'Erro desconhecido.'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao tentar se conectar ao servidor.');
        }
    });
}

// Carregar detalhes da sala (opcional, caso você precise)
async function loadRoomDetails(roomId) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`http://localhost:3000/api/rooms/${roomId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const room = await response.json();
            // Preencha os campos com os detalhes da sala, se necessário
            console.log(room);
        } else {
            const errorData = await response.text();
            alert('Falha ao carregar detalhes da sala: ' + (errorData || 'Erro desconhecido.'));
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes da sala:', error);
        alert('Erro ao tentar se conectar ao servidor.');
    }
}
