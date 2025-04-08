import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { transporter } from '../config/transporter.js';
import { createAccessToken } from '../config/jwt.js';
import { createError } from '../utils/createError.js';

const prisma = new PrismaClient()
export const authController = {
    register: async (req, res, next) => {
        try {
            const { userName, email, password, country } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!userName || !email || !password) {
                return next(createError( 400, 'Vui lòng nhập đầy đủ thông tin'));
            }

            // Kiểm tra xem email đã tồn tại chưa
            const existingUser = await prisma.users.findUnique({
                where: { email }
            });

            if (existingUser) {
                return next(createError( 400, 'Email đã tồn tại'));
            }

            // Mã hóa mật khẩu
            const hashPassword = bcrypt.hashSync(password, 10);

            // Tạo user mới trong database
            const newUser = await prisma.users.create({
                data: {
                    userName,
                    email,
                    password: hashPassword
                }
            });

            // Gửi mail chào mừng
            const welcomeMail = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Welcome",
                html: `
                <h1>Welcome ${userName} to our website</h1>
                `
            }
            // gửi mail
            transporter.sendMail(welcomeMail, (error, info)=>{
                if(error) return next(createError( 500, 'Gửi mail thất bại'))
                

            })
            res.status(201).json({
                message: 'Đăng ký thành công',
                user: {
                    id: newUser.id,
                    userName: newUser.userName,
                    email: newUser.email
                }
            });
            // Trả về response thành công


        } catch (error) {
            console.error('Lỗi trong quá trình đăng ký:', error);
            next(createError( 500, 'Lỗi trong quá trình đăng ký'));
        } finally {
            await prisma.$disconnect();
        }
    },
    login: async (req, res, next) => {
        try {
            // 1. Kiểm tra và lấy dữ liệu đầu vào
            const { email, password } = req.body;
            if (!email || !password) {
                return next(createError( 400, "Email và password không được để trống"));
            }

            // 2. Tìm user trong database
            const userExist = await prisma.users.findUnique({
                where: { email },
            });

            if (!userExist) {
                return next(createError( 404, "Tài khoản không tồn tại"));
            }

            // 3. Kiểm tra trường hợp login bằng Facebook
            if (!userExist.password) {
                return next(createError(400, "Vui lòng đăng nhập Facebook để tiếp tục"));
            }

            // 4. Kiểm tra mật khẩu
            const isPasswordValid = await bcrypt.compare(password, userExist.password);
            if (!isPasswordValid) {
                return next(createError( 401, "Tài khoản hoặc mật khẩu không đúng"));
            }

            // 5. Tạo token
            const payload = {
                id: userExist.id,
            };
        const accessToken = createAccessToken(payload)

            // 6. Đặt cookie và trả về kết quả
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            });

            return res.status(200)
            .set('Authorization', `Bearer ${accessToken}`)
            .json({
                message: "Đăng nhập thành công",
                token: accessToken, // Tùy chọn: trả về token nếu client cần
                user: {
                    userName :userExist.userName,
                    id: userExist.id,
                    email: userExist.email,
                },
            });
        } catch (error) {
            console.error("Lỗi trong quá trình đăng nhập:", error);
            return next(createError(500, "Lỗi hệ thống"));
        } finally {
            await prisma.$disconnect();
        }
    },
    logout: async (req, res, next) => {
        try {
            // 1. Get the token from cookies or headers
            const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(200).json({ 
                    success: true,
                    message: "Đã đăng xuất" 
                });
            }

            // 2. Add token to revoked tokens list (optional)
            try {
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                await prisma.revokedToken.create({
                    data: {
                        token: token,
                        userId: decoded.id,
                        expiresAt: new Date(decoded.exp * 1000) // Convert JWT exp to Date
                    }
                });
            } catch (error) {
                console.error("Error revoking token:", error);
                // Continue with logout even if revocation fails
            }

            // 3. Clear cookies
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            res.clearCookie("refreshToken", { // If you implement refresh tokens
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            // 4. Send success response
            return res.status(200).json({
                success: true,
                message: "Đã đăng xuất "
            });

        } catch (error) {
            console.error("Logout error:", error);
            return next(createError(500, "Logout failed"));
        }
    }
}