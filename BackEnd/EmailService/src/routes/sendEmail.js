import express from "express";
import { sendOtpEmail } from "../controllers/sendOtpEmail.js";
import { sendCustomHtmlEmail } from "../controllers/sendEmail.js";

const router = express.Router();

router.post("/sendEmail",sendCustomHtmlEmail);
router.post("/send-otp", sendOtpEmail);

export default router;