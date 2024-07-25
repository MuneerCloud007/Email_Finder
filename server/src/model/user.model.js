import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import creditSchema from "./credit.model.js";
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    credit:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credit',
        required:true
    }
},{timestamps:true});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
       
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
    const payload = { id: this._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2d' }); // Access token
    return token;
};

// Method to generate Refresh token
userSchema.methods.generateRefreshToken = function () {
    const payload = { id: this._id };
    const refreshToken = jwt.sign(payload,  process.env.JWT_SECRET, { expiresIn: '7d' });
    this.refreshToken = refreshToken;
    return refreshToken;
};

// Method to verify Refresh token
userSchema.methods.verifyRefreshToken = function (token) {
    try {
        const decoded = jwt.verify(token,  process.env.JWT_SECRET);
        return decoded.id === this._id.toString();
    } catch (error) {
        return false;
    }
};

userSchema.methods.comparePassword = async function (password) {
    try {
        const isMatch = await bcrypt.compare(password, this.password);
        if (!isMatch) {
            throw new Error("Password does not match");
        }
        return true;
    } catch (err) {
        throw new Error(err.message || "An error occurred during password comparison");
    }
};
const User = mongoose.model('User', userSchema);

export default  User;
