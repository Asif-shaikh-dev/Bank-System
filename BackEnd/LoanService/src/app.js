//this is loanservice app.js file
import loanAdminRouter from "./routes/loan.admin.route.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LoanService/.env sits at the service root (BackEnd/LoanService/.env),
// two levels up from src/config/. Neither server.js nor app.js in the
// original code ever called dotenv.config(), so process.env.PORT etc.
// were always undefined. This file must be imported FIRST, before
// db.js or anything else that reads process.env.
dotenv.config({ path: path.join(__dirname, "../../.env") });
import express from "express";
import cors from "cors";
import loanRouter from "./routes/loan.route.js";

const app = express();

app.use(cors());
app.use(express.json());

// Serves uploaded loan documents the same way AccountService presumably
// serves onboarding documents — confirm AccountService's app.js has an
// equivalent static route (likely app.use('/uploads', express.static(...)))
// and match its exact mount path, since DocumentViewerModal.jsx on the
// frontend builds URLs assuming a specific prefix.
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.send("Loan Service is running");
});

// Mounted at root /loan (not /loan/api/...) to match
// VITE_LOAN_SERVICE_URL=http://localhost:6000 having no /api suffix.

app.use("/loan/admin", loanAdminRouter);
app.use("/loan", loanRouter);

export default app;