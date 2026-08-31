import express from "express";
import { sendOtpEmail } from "../controllers/sendOtpEmail.js";

const router = express.Router();

router.post("/send-otp", sendOtpEmail);

export default router;