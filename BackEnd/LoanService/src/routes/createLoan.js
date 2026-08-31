import express from "express";
import checkAccountNumber from "../middleware/loan.middleware";
import { createLoan } from "../controllers/createLoan.controller";

const loanRouter = express.Router();

loanRouter.post("/createLoan",checkAccountNumber,createLoan);

export default loanRouter;