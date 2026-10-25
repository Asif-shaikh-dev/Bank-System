import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { createTopupOrder, verifyTopup, getAccountTransactions } from "../controllers/topup.controller.js";

const router = express.Router();
router.use(verifyToken);
router.post("/topup/order", createTopupOrder);
router.post("/topup/verify", verifyTopup);
router.get("/account/:accountId", getAccountTransactions);
export default router;