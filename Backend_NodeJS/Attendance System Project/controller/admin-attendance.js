const AdminAttendance = require('../models/AdminAttendance');
const { addMinutes, isAfter } = require('date-fns');
const error = require('../utils/error');

const findRunningAttendance = async () => {
    return AdminAttendance.findOne({status: 'RUNNING'});
};

const getEnable = async (_req, res, next) => {
    try {
        if (await findRunningAttendance()) {
            throw error('Already Running', 400);
        }

        const attendance = new AdminAttendance();
        await attendance.save();

        return res.status(201).json({ message: 'Success', attendance });
    } catch (e) {
        next(e);
    }
};

const getStatus = async (_req, res, next) => {
    try {
        const runningAttendance = await findRunningAttendance();
        if (!runningAttendance) {
            throw error('Not Running', 400);
        }

        const timeLimit = runningAttendance.timeLimit || 0;
        const expirationTime = addMinutes(new Date(runningAttendance.createdAt), timeLimit);

        if (isAfter(new Date(), expirationTime)) {
            runningAttendance.status = 'COMPLETED';
            await runningAttendance.save();
        }

        return res.status(200).json(runningAttendance);
    } catch (e) {
        next(e);
    }
};

const getDisable = async (_req, res, next) => {
    try {
        const runningAttendance = await findRunningAttendance();
        if (!runningAttendance) {
            throw error('Not Running', 400);
        }

        runningAttendance.status = 'COMPLETED';
        await runningAttendance.save();

        return res.status(200).json(runningAttendance);
    } catch (e) {
        next(e);
    }
};

module.exports = {
    getEnable,
    getStatus,
    getDisable,
};
