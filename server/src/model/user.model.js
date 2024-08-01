import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import creditSchema from "./credit.model.js";
import jwt from 'jsonwebtoken';
import cron from 'node-cron';


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: [true,"Email is neeeded"],
        unique: [true, "Email already exists"],
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    credit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credit',
        required: true
    },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

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
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    this.refreshToken = refreshToken;
    return refreshToken;
};

// Method to verify Refresh token
userSchema.methods.verifyRefreshToken = function (token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// Create TTL index programmatically
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 }); // 3600 seconds = 1 hour

// Schedule a task to run every hour to clean up unverified users
cron.schedule('0 * * * *', async () => {
  const oneHourAgo = new Date(Date.now() - 3600 * 1000);
  try {
    await User.deleteMany({ isVerified: false, createdAt: { $lt: oneHourAgo } });
    console.log('Unverified users deleted');
  } catch (err) {
    console.error('Error deleting unverified users:', err);
  }
});


const User = mongoose.model('User', userSchema);

export default User;
