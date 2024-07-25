#!/usr/bin/env node

import readline from "readline-sync";
import dns from "dns";
import net from "net";
import clipboardy from "clipboardy";
import emailExistence from "email-existence";
import pLimit from "p-limit";
import  disposableEmailDetector  from 'disposable-email-detector';


// Collect first name, last name, domain
const wrapperFunEmailVerfier=async(firstName,lastName,domainName)=>{

// Regex for names
console.log(firstName)
console.log(lastName);
console.log(domainName);
const nameRegex = /^[a-zA-Z]+$/;

// Regex for domain
const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function regexCheck(regex, name, type) {
    while (!regex.test(name)) {
        console.log(`${name} is not a valid ${type}.`);
        //Throw an error
        
    }
}

// // Regex check
 regexCheck(nameRegex, firstName, "first name");
 regexCheck(nameRegex, lastName, "last name");
 regexCheck(domainRegex, domainName, "domain name");

function formats(first, last, domain) {
    const list = [];

    list.push(`${first[0]}@${domain}`); // f@example.com
    list.push(`${first[0]}${last}@${domain}`); // flast@example.com
    list.push(`${first[0]}.${last}@${domain}`); // f.last@example.com
    list.push(`${first[0]}_${last}@${domain}`); // f_last@example.com
    list.push(`${first[0]}-${last}@${domain}`); // f-last@example.com
    list.push(`${first}@${domain}`); // first@example.com
    list.push(`${first}${last}@${domain}`); // firstlast@example.com
    list.push(`${first}.${last}@${domain}`); // first.last@example.com
    list.push(`${first}_${last}@${domain}`); // first_last@example.com
    list.push(`${first}-${last}@${domain}`); // first-last@example.com
    list.push(`${first[0]}${last[0]}@${domain}`); // fl@example.com
    list.push(`${first[0]}.${last[0]}@${domain}`); // f.l@example.com
    list.push(`${first[0]}_${last[0]}@${domain}`); // f_l@example.com
    list.push(`${first[0]}-${last[0]}@${domain}`); // f-l@example.com
    list.push(`${first}${last[0]}@${domain}`); // fistl@example.com
    list.push(`${first}.${last[0]}@${domain}`); // first.l@example.com
    list.push(`${first}_${last[0]}@${domain}`); // fist_l@example.com
    list.push(`${first}-${last[0]}@${domain}`); // fist-l@example.com
    list.push(`${last}@${domain}`); // last@example.com
    list.push(`${last[0]}@${domain}`); // l@example.com

    return list;
}

async function checkCatchAll(domain) {
    return new Promise((resolve, reject) => {
        const testEmail = `randomaddress12345@${domain}`;

        emailExistence.check(testEmail, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
}

const emailsList = formats(firstName, lastName, domainName);
const limit = pLimit(5); // Limit to 5 concurrent requests

async function verify(list) {
    const valid = [];
    console.log(list);
    const domain = list[0].split("@")[1];
    console.log(domain);





    const isCatchAll = await checkCatchAll(domain);
    if (isCatchAll) {
        console.log(`Domain ${domain} is a catch-all.`);
        valid.push({
            type: "catch-all",
            email: list[0],
        });
        return valid;
    }

    const tasks = list.map(email => limit(() => {
        return new Promise(async(resolve, reject) => {
            // const disposableEmail= await disposableEmailDetector(email)
            // if(disposableEmail){
            //     return  valid.push({type:"disposable-email",email:email})
            // }
            emailExistence.check(email, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ email, isValid: response });
                }
            });
        });
    }));

    const results = await Promise.allSettled(tasks);
    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.isValid) {
            console.log(result.value.email);
            valid.push({
                type: "valid",
                email: result.value.email,
            });
        } else if (result.status === 'rejected') {
            console.log(`DNS query could not be performed for ${result.reason.email}: ${result.reason.message}`);
        }
    });

    console.log(valid);
    return valid;
}

const validList=await verify(emailsList).catch((err)=>console.log(err))

function returnValid(valid, possible) {
    if (valid.length === 0) {
        console.log(`No valid email address found for ${firstName} ${lastName}`);
    } else if (valid.length === 1) {
        valid.forEach(i => console.log(i));
        console.log(`Valid email address with length 1`);
    } else if (valid.length === possible.length) {
        console.log("Catch-all server. Verification not possible.");
    } else {
        console.log("Multiple valid email addresses found:");
        valid.forEach(address => console.log(address));
    }
}
return validList
}

export default wrapperFunEmailVerfier;