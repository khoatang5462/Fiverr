import express from "express";
import { userRoute } from "./user.route.js";
import { authRoute } from "./auth.route.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { authController } from "../controller/auth.controller.js";

export  const rootRoutes = express.Router();

rootRoutes.use("/user", userRoute)
rootRoutes.use("/auth", authRoute)
rootRoutes.post("/logout", authenticateUser, authController.logout)