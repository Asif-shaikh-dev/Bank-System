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