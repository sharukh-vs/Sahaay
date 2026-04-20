const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { roles } = require('../config/roles');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email format');
            }
        },
    },
    phone: {
        type: String,
        trim: true,
        default: null,
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
        select: false,
        validate(value) {
            if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                throw new Error('Password must contain at least one number and one letter');
            }
        },
        private: true,
    },
    role: {
        type: String,
        enum: roles,
        default: 'user',
    },
    // Profile fields
    bio: {
        type: String,
        maxlength: 500,
        default: '',
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        country: { type: String, default: 'India' },
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
        },
    },
    preferences: {
        serviceCategories: [{ type: String }],
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
        },
    },
    // Account status
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    // Password reset
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    // Last login
    lastLogin: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
