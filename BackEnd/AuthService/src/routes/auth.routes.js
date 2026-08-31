import express from "express";

import {body} from "express-validator";
import {register,login,forgotPassword, verifyOtp, resetPassword, getCustomerProfile} from "../controllers/auth.controller.js";
import { handleValidationErrors } from "../middleware/validate.js";
const authRouter = express.Router();




authRouter.post("/register",
    body('email_id').isEmail().withMessage('Invalid email address'),
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('phone_no').isLength({ min: 6 }).withMessage('Phone number must be at least 6 digits'),
    body('password').isLength({ min: 6 }).withMessage('Password must be minimum 6 characters bro'),


    handleValidationErrors,
    register
  );


authRouter.post("/login",
    body('email_id').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be minimum 6 characters bro'),

    handleValidationErrors,
    login
)

authRouter.post("/forgot-password",forgotPassword);

authRouter.post("/verify-otp",verifyOtp);

authRouter.post("/reset-password",resetPassword);

authRouter.get("/getCustomerProfile",getCustomerProfile);


export default authRouter;


