const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            maxLength: [50, "First name cannot exceed 50 characters"],
            minLength: [2, "First name should be at least 2 characters"],
        },
        last_name: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            maxLength: [50, "Last name cannot exceed 50 characters"],
            minLength: [2, "Last name should be at least 2 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
        },
        passwordChangedAt: {
            type: Date,
        },
        active: {
            type: Boolean,
            default: true,
            select: false,
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

module.exports = mongoose.model("User", userSchema);
