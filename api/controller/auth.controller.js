import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { transporter } from '../config/transporter.js';
import { createAccessToken } from '../config/jwt.js';
import { createError } from '../utils/createError.js';

const prisma = new PrismaClient();

// Helper function to clear auth cookies
const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    });
};

export const authController = {
    register: async (req, res, next) => {
        try {
            const { userName, email, password, country } = req.body;

            if (!userName || !email || !password) {
                return next(createError(400, 'Vui lòng nhập đầy đủ thông tin'));
            }

            const existingUser = await prisma.users.findUnique({
                where: { email }
            });

            if (existingUser) {
                return next(createError(400, 'Email đã tồn tại'));
            }

            const hashPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.users.create({
                data: {
                    userName,
                    email,
                    password: hashPassword,
                    country
                }
            });

            // Gửi mail bất đồng bộ, không cần await
            const welcomeMail = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Welcome",
                html: `<h1>Welcome ${userName} to our website</h1>`
            };

            transporter.sendMail(welcomeMail, (error) => {
                if (error) console.error('Gửi mail thất bại:', error);
            });

            res.status(201).json({
                message: 'Đăng ký thành công',
                user: {
                    id: newUser.id,
                    userName: newUser.userName,
                    email: newUser.email
                }
            });

        } catch (error) {
            console.error('Lỗi trong quá trình đăng ký:', error);
            next(createError(500, 'Lỗi trong quá trình đăng ký'));
        } finally {
            await prisma.$disconnect();
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return next(createError(400, "Email và password không được để trống"));
            }

            const userExist = await prisma.users.findUnique({
                where: { email },
            });

            if (!userExist) {
                return next(createError(404, "Tài khoản không tồn tại"));
            }

            if (!userExist.password) {
                return next(createError(400, "Vui lòng đăng nhập bằng phương thức xã hội đã sử dụng"));
            }

            const isPasswordValid = await bcrypt.compare(password, userExist.password);
            if (!isPasswordValid) {
                return next(createError(401, "Tài khoản hoặc mật khẩu không đúng"));
            }

            const payload = {
                id: userExist.id,
                email: userExist.email
            };

            const accessToken = createAccessToken(payload);

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            return res.status(200)
                .set('Authorization', `Bearer ${accessToken}`)
                .json({
                    message: "Đăng nhập thành công",
                    user: {
                        id: userExist.id,
                        userName: userExist.userName,
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
            const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                clearAuthCookies(res);
                return res.status(200).json({ 
                    success: true,
                    message: "Đã đăng xuất" 
                });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_KEY);
                
                if (decoded.exp * 1000 < Date.now()) {
                    clearAuthCookies(res);
                    return res.status(200).json({
                        success: true,
                        message: "Đã đăng xuất"
                    });
                }

                const existingRevoked = await prisma.revokedToken.findFirst({
                    where: { token }
                });

                if (!existingRevoked) {
                    await prisma.revokedToken.create({
                        data: {
                            token,
                            userId: decoded.id,
                            expiresAt: new Date(decoded.exp * 1000)
                        }
                    });
                }
            } catch (verifyError) {
                console.error("Token verification error:", verifyError);
                // Tiếp tục quá trình logout dù token có hợp lệ hay không
            }

            clearAuthCookies(res);
            return res.status(200).json({
                success: true,
                message: "Đã đăng xuất thành công"
            });

        } catch (error) {
            console.error("Logout error:", error);
            clearAuthCookies(res);
            return next(createError(500, "Đã xảy ra lỗi khi đăng xuất"));
        } finally {
            await prisma.$disconnect();
        }
    }
};