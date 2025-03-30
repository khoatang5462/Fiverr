import jwt from 'jsonwebtoken';
import { verifyToken } from '../config/jwt.js';

export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
        if (!token) throw new Error('No token provided');
        
        const decoded = verifyToken(token);
        console.log("Authenticated user ID:", decoded.id); // Thêm dòng này
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Lỗi xác thực token:", error);
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ",
            error: error.message,
            solution: "Vui lòng đăng nhập lại để lấy token mới"
        });
    }
}