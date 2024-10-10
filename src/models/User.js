// src/models/User.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; 

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Garante que o email seja único
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    // Opções adicionais se necessário
    timestamps: true, // Adiciona createdAt e updatedAt
});

export default User;
