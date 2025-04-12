import { configDotenv } from "dotenv";
configDotenv();

export const sendMailForgotPassword = (transporter, mailOptions) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Lỗi gửi email:', err);
                reject(err);
            } else {
                console.log('Email đã gửi:', info.response);
                resolve(info);
            }
        });
    });
};