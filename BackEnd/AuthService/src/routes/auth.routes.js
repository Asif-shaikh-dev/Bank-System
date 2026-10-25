import express from "express";

import {body} from "express-validator";
import {register,login,forgotPassword, verifyOtp, resetPassword, getCustomerProfile, logout,getMe} from "../controllers/auth.controller.js";
import { handleValidationErrors } from "../middleware/validate.js";

import { verifyToken } from "../middleware/JWT.js";

const authRouter = express.Router();



authRouter.get("/me", verifyToken, getMe);

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
authRouter.post("/logout",logout)

authRouter.post("/forgot-password",forgotPassword);

authRouter.post("/verify-otp",verifyOtp);

authRouter.post("/reset-password",resetPassword);

authRouter.get("/getCustomerProfile",getCustomerProfile);

authRouter.post("/admin-login",(req,res)=>{
  const {email_id,password} = req.body;
  console.log(`Admin login attempt with email: ${email_id} and password: ${password}`);
  if(email_id === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
    res.status(200).json({success:true,message:"Admin login successful"})
  }else{
    res.status(401).json({success:false,message:"Invalid admin credentials"})
  }

})



export default authRouter;


