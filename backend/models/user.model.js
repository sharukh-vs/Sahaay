const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const { roles } = require('../config/roles');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid Email format");
            }
        },
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
        select: false,
        validate(value) {
            if(!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                throw new Error("Password must contain one number and a letter");
            }
        },
        private: true,
    },
    role: {
        type: String,
        enum: roles,
        default: 'user',

    }

}, {timestamps: true});

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
}

userSchema.pre('save', async function (next) {
    const user = this;
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})


const User = mongoose.model("User", userSchema);

module.exports = User;
