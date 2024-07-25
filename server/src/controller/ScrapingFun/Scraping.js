import ApiError from "../../utils/ApiError.js";
import ProfilePage from "../../webscraping/ProfilePage.js";
import ProfileModel from "../../model/profile.model.js";
import WebscrapingData from '../../webscraping/webscrap.js';
import axios from "axios"
import emailVerificationModel from '../../model/emailverfier.model.js';
import mongoose from 'mongoose';
import companyInfoModel from '../../model/companyInfo.js';
import creditModel from '../../model/credit.model.js';
import {makeRequestWithRetry,extractDomain,delay,CertainityEnum} from "../../helper/helper1.js";




const ProfileScraping=async(profileUrl,cookieData)=>{
    try{
        if(!profileUrl || !cookieData) {
            throw ApiError.badRequest("Missing parameters")
        }
        const data=await ProfilePage(profileUrl,cookieData);
        const createProfile= new ProfileModel(data);
        const newProfile=await createProfile.save();
        return newProfile;

    }
    catch(err){
        throw  ApiError.badRequest(err?.message || "Some thing went wrong in ProfileScraping")
    }
}




const CompleteScrapingSinglePage = async ({ firstName, lastName, user, position, folder, url, socketId, cookieData, profileUrl }) => {
    try {
        console.log("--------------------GOING TO SCRAPE PROFILE PAGE----------------------------");

        const Profile = await ProfileScraping(profileUrl, cookieData);

        if (!url) {
            const createCompanyInfo = new companyInfoModel({
                firstName,
                lastName,
                position,
                "profile": Profile["_id"],
                email: "not found",
                certainty: "not found",
            });
            const newCompanyInfo = await createCompanyInfo.save();

            const emailArr = await emailVerificationModel.find({ $and: [{ user: user }, { folder: folder }] });
            let createEmailVerifier;
            if (emailArr.length == 0) {
                createEmailVerifier = new emailVerificationModel({
                    companyInfo: newCompanyInfo._id,
                    user: user,
                    folder: folder
                });
                createEmailVerifier = await createEmailVerifier.save();
            } else {
                createEmailVerifier = emailArr[0];
                const dummyValue = await emailVerificationModel.findById(createEmailVerifier._id).populate('companyInfo').exec();

                if (!dummyValue.companyInfo) {
                    throw new Error('Failed to retrieve company info.');
                }

                let dummyArray


                if(dummyValue.companyInfo.dynamicFields?.length>0){
                    dummyArray = dummyValue.companyInfo.dynamicFields.reduce((current, vl) => {
                        current.push({
                            name: vl.name,
                            value: '',
                            _id: new mongoose.Types.ObjectId()
                        });
                        return current;
                    }, []);
                }
                else{
                    dummyArray=[];
                }

                newCompanyInfo.dynamicFields = [...dummyArray];
                newCompanyInfo.user = user;
                await newCompanyInfo.save();

                createEmailVerifier.companyInfo.push(newCompanyInfo._id);
                await createEmailVerifier.save();
            }

            const companyInfo = newCompanyInfo;
            const data = formatCompanyData(companyInfo, "not found", "not found", Profile);

            const key = `${companyInfo.firstName} ${companyInfo.lastName}`;
            const result = {
                [key]: {
                    id: createEmailVerifier._id,
                    ...data,
                    folder: createEmailVerifier.folder,
                    user: createEmailVerifier.user
                }
            };

            return result;
        }

        // Credit Cutting 
        const credit = await creditModel.findOne({ user: user });

        if (credit.points < 1) {
            throw new Error("Insufficient points!!!");
        }

        const company_data = await WebscrapingData(url, cookieData);
        let emailResponse1 
        let emailResponse2
        if(company_data["website"]){
         emailResponse1 = await emailVerificationRequest(firstName, lastName, company_data["website"]);
            await delay(4000);
    
             emailResponse2 = await fetchEmailVerification(emailResponse1.data["item"]["_id"]);
    
            if (Object.values(CertainityEnum).includes(emailResponse2?.items[0]?.results.emails?.[0]?.certainty)) {
                credit.points = Math.max(0, credit.points - 1);
                await credit.save();
            }
        }

        

        const createCompanyInfo = new companyInfoModel({
            firstName,
            lastName,
            position,
            ...company_data,
            "profile": Profile["_id"],
            email: emailResponse2?.items[0]?.results?.emails[0]?.email || "not found",
            certainty: emailResponse2?.items[0]?.results.emails?.[0]?.certainty || "not found",
        });
        const newCompanyInfo = await createCompanyInfo.save();

        const emailArr = await emailVerificationModel.find({ $and: [{ user: user }, { folder: folder }] });

        let createEmailVerifier;
        if (emailArr.length == 0) {
            createEmailVerifier = new emailVerificationModel({
                companyInfo: newCompanyInfo._id,
                user: user,
                folder: folder
            });
            createEmailVerifier = await createEmailVerifier.save();
        } else {
            createEmailVerifier = emailArr[0];
            const dummyValue = await emailVerificationModel.findById(createEmailVerifier._id).populate('companyInfo').exec();

            if (!dummyValue.companyInfo) {
                throw new Error('Failed to retrieve company info.');
            }
            let dummyArray


            if(dummyValue.companyInfo.dynamicFields?.length>0){
                dummyArray = dummyValue.companyInfo.dynamicFields.reduce((current, vl) => {
                    current.push({
                        name: vl.name,
                        value: '',
                        _id: new mongoose.Types.ObjectId()
                    });
                    return current;
                }, []);
            }
            else{
                dummyArray=[];
            }


            newCompanyInfo.dynamicFields = [...dummyArray];
            newCompanyInfo.user = user;
            await newCompanyInfo.save();

            createEmailVerifier.companyInfo.push(newCompanyInfo._id);
            await createEmailVerifier.save();
        }

        const companyInfo = newCompanyInfo;
        const data = formatCompanyData(companyInfo, emailResponse2?.items[0].results?.emails[0]?.email || "not found", emailResponse2?.items[0]?.results.emails?.[0]?.certainty || "not found", Profile);

        const key = `${companyInfo.firstName} ${companyInfo.lastName}`;
        const result = {
            [key]: {
                id: createEmailVerifier._id,
                ...data,
                folder: createEmailVerifier.folder,
                user: createEmailVerifier.user
            }
        };

        return result;
    } catch (error) {
        console.log(error);
        throw new Error(error?.message || 'Failed to scrape the website');
    }
};

const formatCompanyData = (companyInfo, email, certainty, profile) => {

    //.replace(/\n/g, ' ')?.replace(/\s\s+/g, ' ')?.trim() || 
    return {
        firstName: companyInfo.firstName,
        lastName: companyInfo.lastName,
        img: companyInfo.img,
        company: companyInfo.company,
        position: companyInfo.position,
        website: companyInfo.website,
        employees: companyInfo.employees,
        industry: companyInfo.industry,
        revenue: companyInfo.revenue,
        country: companyInfo.country,
        description: companyInfo.description || '',
        header_quater: companyInfo.header_quater,
        type: companyInfo.type,
        createdAt: companyInfo.createdAt,
        updatedAt: companyInfo.updatedAt,
        companyInfoId: companyInfo._id,
        email,
        certainty,
        profile
    };
};

const emailVerificationRequest = async (firstName, lastName, website) => {
    const url1 = 'https://app.icypeas.com/api/email-search';
    const EmailVerifierData = {
        firstname: firstName.toLowerCase(),
        lastname: lastName.toLowerCase(),
        domainOrCompany: extractDomain(website)
    };
    const headers = {
        'Authorization': '41b965a9f0a544f1aa43df5bcdaf58168a48bf9dfeb648ac8dc4863d5316498b',
        'Content-Type': 'application/json'
    };
    return await axios.post(url1, EmailVerifierData, { headers });
};

const fetchEmailVerification = async (id) => {
    const url2 = "https://app.icypeas.com/api/bulk-single-searchs/read";
    const EmailVerifierData2 = {
        "user": "LUx6tZABOIKatkTjs8LF",
        "mode": "single",
        "id": id
    };
    const headers = {
        'Authorization': '41b965a9f0a544f1aa43df5bcdaf58168a48bf9dfeb648ac8dc4863d5316498b',
        'Content-Type': 'application/json'
    };
    return await makeRequestWithRetry(url2, EmailVerifierData2, { headers });
};














export {ProfileScraping,CompleteScrapingSinglePage,fetchEmailVerification,emailVerificationRequest,formatCompanyData};