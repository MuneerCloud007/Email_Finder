import ApiError from "../utils/ApiError.js";
import companyWebscrap from "../webscraping/webscrap.js";
import webscrapAuto from "../webscraping/autoWebscrap.js";
import ProfilePage from "../webscraping/ProfilePage.js";
import ProfileModel from "../model/profile.model.js";
import {CompleteScrapingSinglePage} from "../controller/ScrapingFun/Scraping.js"
import companyInfo from "../model/companyInfo.js";


const randomDelay = () => {
    const min = 4000; // 4 seconds in milliseconds
    const max = 15000; // 15 seconds in milliseconds
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


const autoWebscraping = async (req, res, next) => {
    try {
        
        const { start, end, url, cookieData, folder, user } = req.body;
        if (!start || !end || !url) {
            throw ApiError.badRequest("Missing parameters")
        }
        let webscrapAutoData = await webscrapAuto(url, start, end, cookieData);
        const result = [];
        console.log("PLS CHECK IN WEBSCRPING AUTO DATA !!!!!");
        console.log(webscrapAutoData)
        for (let i = 0; i < webscrapAutoData.length; i++) {
            const randomTimer = randomDelay();
            await delay(randomTimer);
            console.log("PLs check everything is coorect naa");
            console.log(webscrapAutoData[i]);
            const firstName = webscrapAutoData[i]["name"].split(" ")[0];
            const lastName = webscrapAutoData[i]["name"].split(" ").splice(1).reduce((current, vl) => {
                if (current.length == 0) {
                    current = current + vl
                }
                else {
                    current = current + " " + vl;
                }
                return current;

            }, "");

            const info = {
                firstName: firstName,
                lastName: lastName, 
                user,
                position: webscrapAutoData[i]["position"], 
                folder,
                url: webscrapAutoData[i]["link"], cookieData,
                profileUrl: webscrapAutoData[i]["profile"]
            }
            const dummy=await companyInfo.findOne({$and:[{firstName:firstName},{lastName:lastName},{user:user}]})
            console.log("ALREADY PRESENT !!!!! IN THE DB AUTO SCRAPING");
            console.log(dummy);

            if(!dummy){
            const data = await CompleteScrapingSinglePage({ ...info });
            result.push(data);
            }
        }

        res.json({
            success: true,
            data: result
        })





    }
    catch (err) {
        next(err);

    }
}


const ProfileScraping = async (req, res, next) => {
    try {
        const { profileUrl, cookieData } = req.body;
        if (!profileUrl || !cookieData) {
            throw ApiError.badRequest("Missing parameters")
        }
        const data = await ProfilePage(profileUrl, cookieData);
        const createProfile = new ProfileModel(data);
        const newProfile = await createProfile.save();


        res.json({
            success: true,
            data: newProfile
        })


    }
    catch (err) {
        next(err);
    }
}
export { autoWebscraping, ProfileScraping };