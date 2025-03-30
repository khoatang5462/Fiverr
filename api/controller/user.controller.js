import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

export const userController = {
    deleteUser: async (req, res) => {
        try {
            const userIdToDelete = parseInt(req.params.id);
            const currentUserId = req.user.id;
            
            console.log(`Attempting delete - Current user: ${currentUserId}, Target user: ${userIdToDelete}`);
            
            if (currentUserId !== userIdToDelete) {
                // Kiểm tra nếu là admin
                const currentUser = await prisma.users.findUnique({
                    where: { id: currentUserId },
                    select: { isAdmin: true }
                });
                
                if (!currentUser?.isAdmin) {
                    return res.status(403).json({
                        success: false,
                        message: `Bạn chỉ có thể xóa tài khoản của chính mình (User ID: ${currentUserId})`
                    })
                }
            }

            // 4. Thực hiện xóa user
            await prisma.users.delete({
                where: { id: userIdToDelete }
            });

            // 5. Xóa cookie accessToken
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            return res.status(200).json({
                success: true,
                message: "User deleted successfully"
            });

        } catch (error) {
            console.error("Error deleting user:", error);
            
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
            
            return res.status(500).json({
                success: false,
                message: "Error deleting user",
                error: error.message
            });
        } finally {
            await prisma.$disconnect();
        }
    }
}