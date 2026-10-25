import express from "express";
import { getTreasury, listAllTransactions } from "../controllers/adminTransactions.controller.js";

const router = express.Router();
// TODO: admin auth once admin login issues a token
router.get("/all", listAllTransactions);
router.get("/treasury", getTreasury);
export default router;