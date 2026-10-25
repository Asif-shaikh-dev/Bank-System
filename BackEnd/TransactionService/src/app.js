import express from "express";
import cors from "cors";
import transactionRouter from "./routes/transaction.route.js";
import transactionAdminRouter from "./routes/transaction.admin.route.js";

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // your Vite port
app.use(express.json());
app.use("/transaction/admin", transactionAdminRouter);
app.use("/transaction", transactionRouter);

export default app;
