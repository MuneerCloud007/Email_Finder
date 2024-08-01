import mail from "../helper/mail.js";

/*
* account.create()
* creconsate a new account part 1: email/pass or social
*/
const create = function ({ current_user, req }) {

    let device, uarr, browser;

    // get ip address
    const ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
        req.connection?.remoteAddress || req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress;

    // / get the user agent
    const ua = req.headers['user-agent'];

    if (ua) {

        device = ua.substring(ua.indexOf('(') + 1, ua.indexOf(')')).replace(/_/g, '.');
        uarr = ua.split(' ');
        browser = uarr[uarr.length - 1];

    }
    let dump_Login = {

        id: current_user.id || current_user.Id || current_user["_id"],
        ip: ip,
        time: new Date(),
        browser: browser,
        device: device,

    }



    return dump_Login;

}

const mailHelper = async function ({ template, current_user,req }) {
    if (template == 'email_verification') {


        let risk = create({ current_user, req });
        await mail.send({
            to: current_user.email,
            locale: 'en',
            id: current_user.id,
            template: 'email_verification',
            content: {
                ip: risk.ip,
                time: risk.time,
                device: risk.device,
                browser: risk.browser
            }
        });
    }
    if(template == "password_reset"){
        let risk = create({ current_user, req });
        await mail.send({
            to: current_user.email,
            locale: 'en',
            id: current_user.id,
            template: 'password_reset',
            content: {
                ip: risk.ip,
                time: risk.time,
                device: risk.device,
                browser: risk.browser
            }
        });

    }









}












export { create , mailHelper};  