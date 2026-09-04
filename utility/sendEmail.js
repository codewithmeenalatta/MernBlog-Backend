import nodemailer  from "nodemailer";
 const sendEmail =  async ({to , subject , html}) => {
           const transporter = nodemailer.createTransport({
            host : process.env.MAIL_HOST,
            port :  process.env.MAIL_PORT,
            auth : {
                user : process.env.MAIL_USER,
                pass  : process.env.MAIL_PASS
            },
           });

           const info = await transporter.sendMail({
            from : process.env.FROM_EMAIL,
            to,
            subject,
            html
           });
           return info.messageId
};
export default sendEmail;