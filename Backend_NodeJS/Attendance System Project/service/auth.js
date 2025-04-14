const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const error = require('../utils/error');
const { findUserByProperty, createNewUser } = require('./user');

const registerService = async ({ name, email, password }) => {
    const existingUser = await findUserByProperty('email', email);
    if (existingUser) {
        throw error('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return createNewUser({ name, email, password: hashedPassword });
};

const loginService = async ({ email, password }) => {
    const user = await findUserByProperty('email', email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw error('Invalid credentials', 400);
    }

    const tokenPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        accountStatus: user.accountStatus,
    };

    return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: '2h',
        algorithm: 'HS256',
    });
};

module.exports = { registerService, loginService };
