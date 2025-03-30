import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { transporter } from '../config/transporter.js';
import { createAccessToken } from '../config/jwt.js';
const prisma = new PrismaClient()
export const authController = {
    register: async (req, res) => {
        try {
            const { userName, email, password, country } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!userName || !email || !password) {
                return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
            }

            // Kiểm tra xem email đã tồn tại chưa
            const existingUser = await prisma.users.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
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
                if(error) return res.status(500).json("Gửi mail thất bại")
                

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
            res.status(500).json({
                message: 'Đã xảy ra lỗi server',
                error: error.message
            });
        } finally {
            await prisma.$disconnect();
        }
    },
    login: async (req, res) => {
        try {
            // 1. Kiểm tra và lấy dữ liệu đầu vào
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Vui lòng cung cấp email và mật khẩu" });
            }

            // 2. Tìm user trong database
            const userExist = await prisma.users.findUnique({
                where: { email },
            });

            if (!userExist) {
                return res.status(400).json({ message: "Tài khoản không tồn tại, vui lòng đăng ký" });
            }

            // 3. Kiểm tra trường hợp login bằng Facebook
            if (!userExist.password) {
                return res.status(400).json({
                    message: "Tài khoản này được đăng ký qua Facebook. Vui lòng dùng Facebook để đăng nhập hoặc đặt lại mật khẩu",
                });
            }

            // 4. Kiểm tra mật khẩu
            const isPasswordValid = await bcrypt.compare(password, userExist.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
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
                    id: userExist.id,
                    email: userExist.email,
                },
            });
        } catch (error) {
            console.error("Lỗi trong quá trình đăng nhập:", error);
            return res.status(500).json({
                message: "Đã xảy ra lỗi server",
                error: error.message,
            });
        } finally {
            await prisma.$disconnect();
        }
    }
}