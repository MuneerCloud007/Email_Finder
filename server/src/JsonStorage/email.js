const email = [
    {
        name:
            "email_verification",
        subject:
            "Please verify your email"
        , body:
            "Thank you for registering! We're thrilled to have you join our community. To complete the registration process and unlock all the exciting features, please click the link below to verify your email address. Your support means the world to us, and we can't wait to embark on this journey together"
        , button_label:
            "Verify Your Email"
        , button_url:
            "{{domain}}?token={{content.verification_token}}"
        , locale:
            "en"
    },
    {

        name: "password_reset",
        subject: "You requested a password reset"
        , body: "We've received a request to reset your password. To ensure the security of your account, please click the link below:",
        button_label: "Reset Password",
        button_url:"{{domain}}?token={{content.token}}",
         locale: "en"
    },
    {
        name:"email_finder",
        subject:"You have recieved Email Finder Link",
        body:"This the information of Sheet  valid={{valid}}  catchall={{catchall}} invalid={{invalid}} in vivaSales a unique id is registered to your sheet",
        button_label: "Get to Email Finder",
        button_url:"{{domain}}/file/:id"

    },
    {
        name:"email_finder_and_verification",
        subject:"You have recieved Email Finder and Verification Link",
        body:"This the information of Sheet  valid={{valid}}  catchall={{catchall}} invalid={{invalid}} in vivaSales a unique id is registered to your sheet",
        button_label: "Get to Email Finder and Verification Link",
        button_url:"{{domain}}/file/:id"

    }
]
export { email };