import express from "express";
import { verifyToken } from "../middleWare/auth.middleware.js";
import { getMyAccounts, getMyAccountById } from "../controllers/accounts.controller.js";

const router = express.Router();
router.use(verifyToken);
router.get("/", getMyAccounts);
router.get("/:id", getMyAccountById);

export default router;