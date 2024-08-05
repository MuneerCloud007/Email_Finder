import User from '../model/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import creditSchema from "../model/credit.model.js";
import { create, mailHelper } from "../helper/account.js";

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
            if (!existingUser["isVerified"]) {

                //User Email integration process started....
                existingUser['firstName'] = firstName;
                existingUser["lastName"] = lastName;
                const salt = await bcrypt.genSalt(10);
                const newPassword = await bcrypt.hash(password, salt);
                existingUser = await User.findByIdAndUpdate(existingUser["_id"], {
                    firstName: firstName,
                    lastName: lastName,
                    password: newPassword,

                }, {
                    new: true
                })
                await mailHelper({
                    current_user: existingUser,
                    template: 'email_verification',
                    req: req
                });

                return res.status(200).json({ msg: 'Please check your inbox for the email' });


            }
            else {
                throw ApiError.badRequest("User Already Exists")
            }

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

        // Update credit with user reference
        newCredit.user = user._id;
        await newCredit.save();

        //User Email integration process started....
        await mailHelper({
            current_user: user,
            template: 'email_verification',
            req: req
        });

        res.status(200).json({ msg: 'Please check your inbox for the email' });
    } catch (err) {
        console.error('Registration Error:', err); // Improved error logging
        next(err);
    }
};

const emailVerify = async (req, res, next) => {
    try {

        const { id } = req.params;
        if (!id) {
            throw ApiError.unauthorized("Your are not authorized user !!!!");
        }
        const user = await User.findById(id);
        console.log(user);

        if (!user || user["isVerified"]) {
            throw ApiError.notFound("User not found");
        }
        user["isVerified"] = true;
        const token = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();
        await user.save();

        res.cookie('token', token, { httpOnly: true, secure: false }); // Set 'secure: true' if using HTTPS
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });
        console.log("I am inside the login controller !!");
        console.log(user);

        res.json({ message: "user login successfully", token, refreshToken, userId: user["_id"] });


    }
    catch (err) {
        next(err);

    }

}

const forgotpasswordUpdate = async (req, res, next) => {
    try {
        const { password } = req.body;
        const { id } = req.params;

        console.log(password);
        console.log(id);

        if (!id || !password) {
            return next(ApiError.unauthorized("You are not authorized user!"));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(ApiError.notFound("User not found"));
        }

        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(password, salt);

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            password: newPassword,
        }, {
            new: true,
        });

        console.log(updatedUser);

        res.json({
            success: true,
            data: { message: "Password updated successfully" },
        });

    } catch (err) {
        next(err);
    }
};


const forgotpassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log(email);
        const user = await User.findOne({ email });
        if (!user) {
            throw ApiError.notFound("User not found");
        }

        await mailHelper({
            current_user: user,
            template: 'password_reset',
            req: req
        });

        res.status(200).json({
            message: "Password is reset pls check your mail !!"
        })


    }
    catch (err) {
        next(err);
    }
}



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

        console.log("Matched data");

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        const token = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();
        await user.save();

        res.cookie('token', token, { httpOnly: true, secure: false }); // Set 'secure: true' if using HTTPS
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });
        console.log("I am inside the login controller !!");






        res.json({ message: "user login successfully", token, refreshToken, userId: user["_id"] });
    } catch (err) {
        console.log(err);
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
export { register, refresh, logout, login, getUserData, updatePassword, forgotpassword, emailVerify, forgotpasswordUpdate };
