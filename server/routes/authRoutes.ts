import express from "express";
import { login, sendOtp, verifyOtp } from "../controllers/authController";

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.post("/send-otp", sendOtp);
authRoutes.post("/verify-otp", verifyOtp);

export default authRoutes;