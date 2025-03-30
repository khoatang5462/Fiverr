import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';

configDotenv()

export const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_KEY, { // Đổi từ JWT_key thành JWT_KEY
        algorithm: "HS256",
        expiresIn: "30d"
    })
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_KEY);
}