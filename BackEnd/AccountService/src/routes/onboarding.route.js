import expess from "express";
import {body} from "express-validator";
import { getOnboardingList, handleOnboarding } from "../controllers/onboarding.controller.js";
import { handleValidationErrors } from "../middleWare/validate.js";
import { upload } from "../middleWare/upload.middleware.js";

const onBoardingRouter = expess.Router();

onBoardingRouter.post("/apply",
    upload.fields([
        { name: 'proof_of_identity', maxCount: 1 },
        { name: 'proof_of_address', maxCount: 1 },
        { name: 'passport_size_photo', maxCount: 1 }
    ]),
    body('email_id').isEmail().withMessage('Invalid email format'),
    body('aadhaar_no').isLength({ min: 12, max: 12 }).withMessage('Aadhaar must be exactly 12 digits'),
    handleValidationErrors,
    handleOnboarding

);


onBoardingRouter.get("/list",getOnboardingList)
export default onBoardingRouter;