import mongoose from "mongoose";
import SingleModel from "../model/single.model.js";
import ApiError from "../utils/ApiError.js";
import { findEmail, getSearchResult, checkSearchProgress } from "./SingleHelper/EmailFinder.js";
import { fetchEmailVerification } from "./SingleHelper/EmailFinderAndVerification.js"
import { delay } from "./SingleHelper/helper.js";
import creditModel from "../model/credit.model.js";






const singleEmailFinder = async (req, res, next) => {
    try {
        const { firstName, lastName, domain, companyName, socket, user } = req.body;
        console.log(req.body);
        if (!firstName && !lastName && (!domain || !companyName) && !user) {
            throw ApiError.badRequest("All required fields are not given !!!");
        }
        const credit = await creditModel.findOne({ user: user });

        if (credit.points < 1) {
            return res.status(400).send('Insufficient points');
        }
        const newSingleData = await SingleModel({
            firstName,
            lastName,
            domain,
            companyName,
            user: new mongoose.Types.ObjectId(user),
            operational: "Email Finder",
            completed: "pending"


        })

        await newSingleData.save();
        req.io.to(socket).emit("Single_Finder_Pending", {
            message: "Single message is pending !!!",
            success: true

        })

        //Now Email Finder APi integaration is done ...
        const thirdParameter=(domain?.length>0)?domain:companyName;


        const responseFindEmail = await findEmail(firstName, lastName, thirdParameter);

        // responseFindEmail contains the id and with this we check the status if status is true if it's found then we come out of loop
        //We need search Id


        //After comming out of loop now we check and retrive the data and store it in db...
        await delay(5000);
        const findEmailId = responseFindEmail["item"]["_id"];
        const retriveData = await getSearchResult(findEmailId);

        //Now Process of Storing data in db is started and socket request to fronted that is added
        const responseData = {
            fullName: retriveData["items"][0]["results"]["fullname"],
            email: retriveData["items"][0]["results"]?.["emails"]?.[0]?.["email"] || "unknown",
            mxProvider: retriveData["items"][0]["results"]?.["emails"]?.[0]?.["mxProvider"] || "unknown",
            certainity: retriveData["items"][0]["results"]?.["emails"]?.[0]?.["certainty"] || "unknown",
            mxRecords: retriveData["items"][0]["results"]?.["emails"]?.[0]?.["mxRecords"]?.[0] || "unknown"
        }
        console.log("responseData is here pls check");
        newSingleData.email = responseData.email
        newSingleData.mxProvider = responseData.mxProvider
        newSingleData.certainity = responseData.certainity;
        newSingleData.mxRecords = responseData.mxRecords
        newSingleData.completed="completed"


        await newSingleData.save();

        req.io.to(socket).emit("Single_Finder_Success", {
            message: "Single message is  completed!!!",
            success: true

        })

        res.status(200).json({
            success: true,
            message: "Data is saved in db",
            data: newSingleData
        })


    }
    catch (err) {
        next(err);
    }

}

const singleEmailFinderAndVerification = async (req, res, next) => {
    try {
        const { firstName, lastName, domain, companyName, socket, user } = req.body;
        console.log(req.body);

        if (!firstName && !lastName && (!domain || !companyName) && !user) {
            throw ApiError.badRequest("All required fields are not given !!!");
        }

        const userId = new mongoose.Types.ObjectId(user);
        console.log("userId pls check");
        console.log(userId);
        const credit = await creditModel.findOne({ user: userId });

        if (!credit) {
            return res.status(400).send('Credit not found for the user');
        }
        if (credit.points < 1) {
            return res.status(400).send('Insufficient points');
        }

        credit.points -= 1;

        const newSingleData = new SingleModel({
            firstName,
            lastName,
            domain,
            companyName,
            user: userId,
            operational: "Email Verification",
            completed: "pending"
        });

        await newSingleData.save();

        req.io.to(socket).emit("Single_Verification_Pending", {
            message: "Single message is pending !!!",
            success: true
        });
        const thirdParameter=(domain?.length>0)?domain:companyName;

        const responseFindEmail = await findEmail(firstName, lastName, thirdParameter);

        await delay(5000);
        const findEmailId = responseFindEmail["item"]["_id"];
        const retriveData = await getSearchResult(findEmailId);

        const responseData = {
            fullName: retriveData["items"][0]["results"]["fullname"],
            email: retriveData["items"][0]["results"]?.["emails"]?.[0]?.["email"] || "unknown",
            mxProvider: retriveData["items"][0]["results"]?.["emails"]?.[0]?.["mxProvider"] || "unknown",
            certainity: retriveData["items"][0]["results"]?.["emails"]?.[0]?.["certainty"] || "unknown",
            mxRecords: retriveData["items"][0]["results"]?.["emails"]?.[0]?.["mxRecords"]?.[0] || "unknown"
        };
        console.log("responseData is here pls check");

        if (responseData.email === "unknown") {
            newSingleData.email = responseData.email;
            newSingleData.mxProvider = responseData.mxProvider;
            newSingleData.certainity = responseData.certainity;
            newSingleData.mxRecords = responseData.mxRecords;
            newSingleData.completed = "completed";

            await newSingleData.save();
            await credit.save();

            req.io.to(socket).emit("Single_Verification_Success", {
                message: "Single message verification is completed !!!",
                success: true
            });

            return res.status(200).json({
                success: true,
                message: "Data is saved in db",
                data: newSingleData
            });
        }

        const emailFinded = await fetchEmailVerification(responseData.email);

        newSingleData.email = responseData.email;
        newSingleData.mxProvider = responseData.mxProvider;
        newSingleData.certainity = responseData.certainity;
        newSingleData.mxRecords = responseData.mxRecords;
        newSingleData.quality = emailFinded.quality;
        newSingleData.status = emailFinded.result;
        newSingleData.completed = "completed";

        await newSingleData.save();

        credit.points -= 1;
        await credit.save();

        await delay(2000);

        req.io.to(socket).emit("Single_Verification_Success", {
            message: "Single message verification is completed !!!",
            success: true
        });

        res.status(200).json({
            success: true,
            data: newSingleData,
            message: "Email Finding and verification is completed!!!"
        });

    } catch (err) {
        next(err);
    }
};

const getAllEmailSearch=async (req,res,next)=>{
    try{
        const {id}=req.body;
        if(!id){
            throw ApiError.badRequest("User ID is not provided");
        }
        const emailSearch=await SingleModel.find({user:id});
        
        res.status(200).json(emailSearch);




    }
    catch(err){
        next(err);

    }
}


export { singleEmailFinder, singleEmailFinderAndVerification,getAllEmailSearch }