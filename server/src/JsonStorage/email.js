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
    }
]
export { email };