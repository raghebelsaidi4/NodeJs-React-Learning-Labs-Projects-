const User = require('../models/User');
const userService = require('../service/user');
const authService = require('../service/auth');
const error = require('../utils/error');

/**
 * Helper function to find a user by ID and return 404 if not found.
 */
const findUserOrFail = async (userId) => {
    const user = await userService.findUserByProperty('_id', userId);
    if (!user) {
        throw error('User not found', 404);
    }
    return user;
};

const getUsers = async (req, res, next) => {
    try {
        /**
         * TODO: Add filtering, sorting, pagination, and field selection
         */
        const users = await userService.findUsers();
        return res.status(200).json(users);
    } catch (e) {
        next(e);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await findUserOrFail(req.params.userId);

        const {password, ...userWithoutPassword} = user.toObject(); // Exclude password
        return res.status(200).json(userWithoutPassword);
    } catch (e) {
        next(e);
    }
};

const postUser = async (req, res, next) => {
    try {
        const user = await authService.registerService(req.body);
        return res.status(201).json(user);
    } catch (e) {
        next(e);
    }
};

const putUserById = async (req, res, next) => {
    try {
        const user = await userService.updateUser(req.params.userId, req.body);

        if (!user) {
            return next(error('User not found', 404));
        }

        const {password, ...userWithoutPassword} = user.toObject();
        return res.status(200).json(userWithoutPassword);
    } catch (e) {
        next(e);
    }
};

const patchUserById = async (req, res, next) => {
    try {
        const user = await findUserOrFail(req.params.userId);

        Object.assign(user, req.body);
        await user.save();

        const {password, ...userWithoutPassword} = user.toObject();
        return res.status(200).json(userWithoutPassword);
    } catch (e) {
        next(e);
    }
};

const deleteUserById = async (req, res, next) => {
    try {
        const user = await findUserOrFail(req.params.userId);

        await user.deleteOne();
        return res.status(204).send();
    } catch (e) {
        next(e);
    }
};

module.exports = {
    getUsers,
    getUserById,
    postUser,
    putUserById,
    patchUserById,
    deleteUserById,
};
