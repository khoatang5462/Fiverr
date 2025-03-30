import express from "express";
import { userRoute } from "./user.route.js";
import { authRoute } from "./auth.route.js";

export  const rootRoutes = express.Router();

rootRoutes.use("/user", userRoute)
rootRoutes.use("/auth", authRoute)