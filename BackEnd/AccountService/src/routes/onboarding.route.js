import expess from "express";
import {body} from "express-validator";
import { handleOnboarding } from "../controllers/onboarding.controller.js";
import { handleValidationErrors } from "../middleWare/validate.js";
const onBoardingRouter = expess.Router();

onBoardingRouter.post("/apply",
    body('email_id').isEmail().withMessage('Invalid email format'),
    body('aadhaar_no').isLength({ min: 12, max: 12 }).withMessage('Aadhaar must be exactly 12 digits'),


    handleValidationErrors,
    
    handleOnboarding

);

export default onBoardingRouter;