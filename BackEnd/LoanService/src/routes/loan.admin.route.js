import express from "express";
import { listPendingLoans, approveLoan, rejectLoan, runEmiCollection, readEmiInterval, updateEmiInterval } from "../controllers/adminLoan.controller.js";

const router = express.Router();
// TODO: add admin auth middleware here once admin login issues a token.
router.get("/pending", listPendingLoans);
router.post("/:id/approve", approveLoan);
router.post("/:id/reject", rejectLoan);
router.post("/collect-emis", runEmiCollection);
router.get("/emi-interval", readEmiInterval);
router.post("/emi-interval", updateEmiInterval);
export default router;