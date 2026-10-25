import express from "express";
import { verifyToken } from "../middleWare/auth.middleware.js";
import { getMyApplication } from "../controllers/profile.controller.js";

const router = express.Router();
router.use(verifyToken);
router.get("/application", getMyApplication);

export default router;