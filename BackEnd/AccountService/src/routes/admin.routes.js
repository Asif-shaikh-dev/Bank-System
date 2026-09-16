import expess from "express";
import {body} from "express-validator";
import { getOnboardingList,approveOnboardingApplication,rejectOnboardingApplication } from "../controllers/admin.contoller.js";
import { handleValidationErrors } from "../middleWare/validate.js";

const adminRouter = expess.Router();


adminRouter.get("/getOnboardingList", getOnboardingList);
adminRouter.post("/OnboardingList/approve/:id", approveOnboardingApplication);
adminRouter.post("/OnboardingList/reject/:id", rejectOnboardingApplication);


export default adminRouter;