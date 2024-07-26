import User from '../model/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import FolderSchema from "../model/folder.model.js";
import creditSchema from "../model/credit.model.js";


const register = async (req, res, next) => {
    console.log(req.body);
    const { name: username, email, password } = req.body;
    try {
        console.log(username)
        let user = await User.findOne({ username });
        if (user) {
            throw ApiError.badRequest('User already exists');
        }

        let newCredit = new creditSchema({

        })
        newCredit = await newCredit.save();
        console.log(newCredit);


        user = new User({ username, email, password, credit: newCredit });
        await user.save();

        newCredit["user"] = user["_id"];
        await newCredit.save();

        const newFolder = new FolderSchema({
            FolderName: "New Folder",
            user: user,
            checked: true
        })
        await newFolder.save()
        res.status(200).json({ msg: 'User registered successfully' });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    const { username, password } = req.body;
    console.log(req.body);
    const ip = req.ip || req.connection.remoteAddress; // Get the IP address from the req object
    const userAgent = req.headers['user-agent']; // Get the User Agent from the req object
    const uniqueRoom = `${ip}`; // Create the same unique room identifier
    try {
        const user = await User.findOne({ username });
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
export { register, refresh, logout, login, getUserData,updatePassword };
