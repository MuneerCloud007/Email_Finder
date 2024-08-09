import fs from 'fs';
import nodemailer from 'nodemailer';
import zeptoMail from 'nodemailer-smtp-transport';
import i18n from 'i18n';
import { email } from "../JsonStorage/email.js";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * send()
 * Send an email using mailgun
 * @param {Object} data - email data
 * @param {string} data.to - recipient email address
 * @param {Object} data.content - values to inject
 * @param {string} data.custom - optional: custom HTML template
 */

// Define your transport
const createTransport = () => {
  return nodemailer.createTransport({
    host: 'smtp.zeptomail.in',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: 'emailapikey',
      pass: 'PHtE6r1bF+Dij2UvpBNU7PLtFsagMNwmr+MxJABE4YZKDfVQTU0HotB+xDK3qx55B6JBRqbKmo9u4r6e4uPXcWvoMz0YWWqyqK3sx/VYSPOZsbq6x00atVsfdUDfV4Lmct9j3CzfvtbdNA==',
    },
  });
};

export const send = async (data) => {
  // Validate email address
  const rex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|'(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*')@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

  if (rex.test(data.to.toLowerCase())) {
    const transport = createTransport();

    // Get content from DB
    let content = email.filter(email => email.name === data.template)[0];
    content = { ...content, id: data.id, fileId: data?.fileId };

    const html = await createEmail({ template: data.html_template || 'template', content, values: data.content ,externalInfo:data?.["externalInfo"] || null});

    try {
      console.log("Sending email to:", data.to);
      console.log("Subject:", content.subject);

      await transport.sendMail({
        from: "noreply@webapp.onlylwc.com",
        to: data.to,
        subject: content.subject || data?.subject,
        html: html,
      });

      console.log("Email sent successfully.");
    } catch (error) {
      console.error("Error sending email:", error);
      // Handle the error, e.g., log to a monitoring service
    }
  } else {
    throw new Error("Invalid Email");
  }
};

/**
 * createEmail()
 * Opens HTML email template and injects content into the {}
 * @param {Object} options - options for creating email
 * @param {string} options.template - name of the HTML file located in /emails (default: template.html)
 * @param {Object} options.content - object containing body and button
 * @param {Object} options.values - values to inject into content
 * @returns {Promise<string>} - Generated HTML email
 */
const createEmail = async ({ template, content, values,externalInfo }) => {
  const domain = "noreply@webapp.onlylwc.com";
  let usersPath;
  if (content.name === "email_finder" || content.name === "email_finder_and_verification") {
    usersPath = path.join(__dirname, '..', '..', 'src', 'emails', `${"template_email"}.html`);

  }
  else {
    usersPath = path.join(__dirname, '..', '..', 'src', 'emails', `${template}.html`);
  }
  let email;

  try {
    email = fs.readFileSync(usersPath, 'utf8');
  } catch (error) {
    throw new Error(`Error reading email template: ${error.message}`);
  }

  email = email.replace(/{{domain}}/g, values?.domain || domain);

  if (content) {
    content.title = content.title || content.subject;
    content.preheader = content.preheader || content.body;

    if (content.button_url?.includes('{{domain}}')) {
      content.button_url = content.button_url.replace(/{{domain}}/g, values?.domain || domain);
    }

    if (values?.name && content.name !== 'contact') {
      content.body.unshift(`Hi ${values.name},`);
    }

    content.body = `<p style="font-family: 'Source Sans Pro', helvetica, sans-serif; font-size: 15px; font-weight: normal; Margin: 0; Margin-bottom: 15px; line-height: 1.6;">${content.body}</p>`;

    email = email.replace(/{{title}}/g, content.title);
    email = email.replace('{{preheader}}', content.preheader);
    email = email.replace('{{body}}', content.body);

    let callback_url


    if (content.name === "password_reset") {
      callback_url = `${process.env["SERVER_URL"]}/resetpassword/verify/${content.id}`
    }

    if (content.name === "email_verification") {
      callback_url = `${process.env["SERVER_URL"]}/emailVerify/${content.id}`;
    }

    if (content.name === "email_finder") {
      callback_url = `${process.env["SERVER_URL"]}/file/${content.fileId}`;
      email=email.replace('{{Operational}}',"Email Finder");
      email=email.replace('{{valid}}',"N/A");
      email=email.replace('{{invalid}}',"N/A");
      email=email.replace("{{catchall}}","N/A");
      email=email.replace("{{name}}",externalInfo["name"]);

    }
    if (content.name === "email_finder_and_verification") {
      callback_url = `${process.env["SERVER_URL"]}/file/${content.fileId}`
      email=email.replace('{{Operational}}',"Email Verification");
      email=email.replace('{{valid}}',externalInfo["data"]["valid"]);
      email=email.replace('{{invalid}}',externalInfo["data"]["invalid"]);
      email=email.replace("{{catchall}}",externalInfo["data"]["catchall"]);
      email=email.replace("{{name}}",externalInfo["name"]);

    }




    email = email.replace('{{button.url}}', callback_url);
    email = email.replace('{{button.label}}', content.button_label);

    if (values) {
      for (const key in values) {
        const rex = new RegExp(`{{content.${key}}}`, 'g');
        email = email.replace(rex, values[key]);
      }
    }
  }

  return email;
};


const mail = {
  send: send
}
export default mail
