import express from "express";
import {userController} from '../controller/user.controller.js'
import { authenticateUser } from "../middleware/auth.middleware.js";
export const userRoute = express.Router();

userRoute.delete("/:id", authenticateUser, userController.deleteUser);