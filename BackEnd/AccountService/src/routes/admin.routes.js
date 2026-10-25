import expess from "express";
import {body} from "express-validator";
import { getOnboardingList,approveOnboardingApplication,rejectOnboardingApplication } from "../controllers/admin.contoller.js";
import { handleValidationErrors } from "../middleWare/validate.js";
import { getAccountHolders, listAadhaar, addAadhaar, listPan, addPan } from "../controllers/adminData.controller.js";

const adminRouter = expess.Router();


adminRouter.get("/getOnboardingList", getOnboardingList);
adminRouter.post("/OnboardingList/approve/:id", approveOnboardingApplication);
adminRouter.post("/OnboardingList/reject/:id", rejectOnboardingApplication);


adminRouter.get("/account-holders", getAccountHolders);
adminRouter.get("/kyc/aadhaar", listAadhaar);
adminRouter.post("/kyc/aadhaar", addAadhaar);
adminRouter.get("/kyc/pan", listPan);
adminRouter.post("/kyc/pan", addPan);
export default adminRouter;