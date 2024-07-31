import User from '../model/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import FolderSchema from "../model/folder.model.js";
import creditSchema from "../model/credit.model.js";

const register = async (req, res, next) => {
    console.log(req.body);
    const { firstName, lastName, email, password } = req.body;

    try {
        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            throw ApiError.badRequest('User already exists');
        }

        // Create and save new credit
        let newCredit = new creditSchema({});
        newCredit = await newCredit.save();
        console.log('New Credit Saved:', newCredit);

        // Create and save new user
        let user = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password: password.trim(),
            credit: newCredit._id
        });
        user = await user.save();
        console.log('User Saved:', user);

        // Update credit with user reference
        newCredit.user = user._id;
        await newCredit.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error('Registration Error:', err); // Improved error logging
        next(err);
    }
};
const login = async (req, res, next) => {
    let { email, password } = req.body;

    email = email.trim();
    password = password.trim();
    console.log(req.body);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        const token = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();
        await user.save();

        res.cookie('token', token, { httpOnly: true, secure: false }); // Set 'secure: true' if using HTTPS
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });
        console.log("I am inside the login controller !!");
        console.log(user);






        res.json({ message: "user login successfully", token, refreshToken, userId: user["_id"] });
    } catch (err) {
        next(err);
    }
};

const refresh = async (req, res, next) => {
    const { refresh_Token } = req.body;
    let refreshToken = refresh_Token || req.cookies["refreshToken"]
    try {
        if (!refreshToken) {
            throw ApiError.unauthorized('No refresh token provided');
        }

        const user = await User.findOne({ refreshToken });
        if (!user) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        const isValid = user.verifyRefreshToken(refreshToken);
        if (!isValid) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        const token = user.generateAuthToken();
        const newRefreshToken = user.generateRefreshToken();
        await user.save();

        res.cookie('token', token, { httpOnly: true, secure: false }); // Set 'secure: true' if using HTTPS
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: false });


        res.json({ 'message': "new access refresh token", token, refreshToken: newRefreshToken });
    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
};
const getUserData = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new ApiError.badRequest("Please provide a user id");
        }
        const user = await User.findById(id);
        if (!user) {
            throw new ApiError.badRequest("User not found");
        }
        res.json({
            success: true,
            data: user
        }
        );


    }
    catch (err) {
        next(err);

    }
}
const forgotPassword = async (req, res, next) => {
    try {
        let { email, newpassword, oldpassword } = req.body;
        email = email.trim();
        newpassword = newpassword.trim();
        oldpassword = oldpassword.trim();

        // Validate inputs
        if (!email || !oldpassword || !newpassword) {
            throw ApiError.badRequest("Missed email or new password credentials");
        }

        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
            throw ApiError.badRequest("User not found");
        }

        // Verify old password
        const isValidPassword = await user.comparePassword(oldpassword);
        if (!isValidPassword) {
            throw ApiError.badRequest("Invalid old password");
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newpassword, salt);
        
        // Update user with new password
        await User.findByIdAndUpdate(
            user._id,
            { password: hashedPassword },
            { new: true }  // This option returns the updated document
        );

        // Send success response
        res.status(200).json({ message: "Password is updated!!!" });
    } catch (error) {
        console.error('Error in forgotPassword controller:', error);
        next(error); // Pass errors to global error handler
    }
};


const updatePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!id) {
            return next(ApiError.badRequest("Please provide user id"));
        }
        if (!oldPassword || !newPassword) {
            return next(ApiError.badRequest("Please provide old and new password"));
        }

        const user = await User.findById(id); // Use await to get the user document
        if (!user) {
            return next(ApiError.badRequest("There is no user with this id"));
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return next(ApiError.badRequest("Old password is incorrect"));
        }

        user.password = await bcrypt.hash(newPassword, 10); // Hash the new password before saving
        await user.save();

        res.json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (err) {
        next(err);
    }
};
export { register, refresh, logout, login, getUserData, updatePassword, forgotPassword };
