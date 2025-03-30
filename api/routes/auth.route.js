import express from "express";
import { authController } from "../controller/auth.controller.js";

export const authRoute = express.Router()

authRoute.post("/register", authController.register)
authRoute.post("/login", authController.login)
authRoute.post("/logout", )