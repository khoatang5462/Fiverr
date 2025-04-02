import { PrismaClient } from "@prisma/client";
import express from "express";
import { rootRoutes } from "./routes/rootRoutes.js";
import cookieParser from "cookie-parser"
const prisma = new PrismaClient()
const app = express()
const port = 8800
app.use(express.json())
app.use("/api",rootRoutes)
app.use(cookieParser())
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || "Đã xảy ra lỗi server";
    res.status(statusCode).json({ message });
});


try {
    await prisma.$connect();
    console.log("Connected to data!");

    app.listen(port, () => {
        console.log(`server is running on port ${port}`)
    })
} catch (error) {
    console.error("Database connection error:", error);
}


// GET endpoint to retrieve user data
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.users.findMany();
        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving users' });
    }
});







// app.get("/welcome", (req, res)=>{
//     res.send("welcome to my server")
// })


// app.get("/users/:id", (req, res)=>{
//     const id = req.params.id
//     return res.send(`Value id :${id}`)
// }) 