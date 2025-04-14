const { addMinutes, isAfter } = require('date-fns');
const AdminAttendance = require('../models/AdminAttendance');
const StudentAttendance = require('../models/StudentAttendance');
const error = require('../utils/error');

/**
 * Helper function to find the currently running attendance session.
 * @returns {Promise<AdminAttendance | null>}
 */
const findRunningAttendance = async () => {
    return AdminAttendance.findOne({ status: 'RUNNING' });
};

/**
 * Handles student attendance registration.
 * Steps:
 * 1. Find the admin attendance session by ID.
 * 2. Check if the session is still running or already completed.
 * 3. Verify if the student has already registered.
 * 4. Register the student's attendance if not already registered.
 */
const getAttendance = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Step 1: Find the admin attendance session by ID
        const adminAttendance = await AdminAttendance.findById(id);

        if (!adminAttendance) {
            throw error('Invalid Attendance ID', 400);
        }

        // Step 2: Ensure the attendance session is still active
        if (adminAttendance.status === 'COMPLETED') {
            throw error('Attendance already completed', 400);
        }

        // Step 3: Check if the student has already registered
        const existingAttendance = await StudentAttendance.findOne({
            adminAttendance: id,
            user: req.user._id,
        });

        if (existingAttendance) {
            throw error('Already registered', 400);
        }

        // Step 4: Register the student's attendance
        const newAttendance = await new StudentAttendance({
            user: req.user._id,
            adminAttendance: id,
        }).save();

        return res.status(201).json(newAttendance);
    } catch (e) {
        next(e);
    }
};

/**
 * Retrieves the current attendance session status.
 * Steps:
 * 1. Find any active attendance session (status: RUNNING).
 * 2. If no session is running, return an error.
 * 3. Check if the session has expired based on the time limit.
 * 4. If expired, update its status to "COMPLETED".
 */
const getAttendanceStatus = async (req, res, next) => {
    try {
        // Step 1: Find the currently running attendance session
        const runningAttendance = await findRunningAttendance();

        if (!runningAttendance) {
            throw error('Not Running', 400);
        }

        // Step 2: Calculate the session expiration time
        const expirationTime = addMinutes(
            new Date(runningAttendance.createdAt),
            runningAttendance.timeLimit || 0
        );

        // Step 3: If the session has expired, update its status
        if (isAfter(new Date(), expirationTime)) {
            runningAttendance.status = 'COMPLETED';
            await runningAttendance.save();
        }

        return res.status(200).json(runningAttendance);
    } catch (e) {
        next(e);
    }
};

module.exports = {
    getAttendance,
    getAttendanceStatus,
};
