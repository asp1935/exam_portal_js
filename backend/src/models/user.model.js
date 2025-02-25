import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';
import jwt from 'jsonwebtoken';

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('superadmin', 'admin', 'user'),
            allowNull: false,
            defaultValue: 'user',
        },
        permissions: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
    },
    {
        hooks: {
            // Hash the password before saving the user
            beforeCreate: async (user) => {
                if (user.password) {
                    const bcrypt = await import('bcrypt');
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const bcrypt = await import('bcrypt');
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
        },
    },

);

// Add a method to validate the password
User.prototype.validatePassword = async function (password) {
    const bcrypt = await import('bcrypt');
    return await bcrypt.compare(password, this.password);
};

// Add a method to generate an access token
User.prototype.genrateAccessToken = function () {
    const payload = {
        id: this.id,
        email: this.email,
        role: this.role,
        permissions: this.permissions
    };
    const secretKey = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRY;
    return jwt.sign(payload, secretKey, { expiresIn });
};

export default User;

