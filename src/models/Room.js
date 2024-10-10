import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Room = sequelize.define('Room', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    participants: {
        type: DataTypes.JSON, // JSON para armazenar uma lista de participantes
        allowNull: true,
    },
}, {
    timestamps: true,
});

// Método para adicionar um participante
Room.prototype.addParticipant = async function(userId) {
    if (!this.participants) {
        this.participants = [];
    }

    // Se o usuário já estiver na lista, não adiciona
    if (!this.participants.includes(userId)) {
        this.participants.push(userId);
        await this.save(); // Salva as alterações
    } else {
        console.log('Usuário já é um participante'); // Log se o usuário já for um participante
    }
};

export default Room;
