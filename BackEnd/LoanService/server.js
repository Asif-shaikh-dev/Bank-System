// BackEnd/LoanService/server.js
import "./src/config/env.js";   // first import
import app from "./src/app.js";
import connectDb from "./src/config/db.js";

const PORT = process.env.LOAN_SERVICE_PORT;
await connectDb();
import { pool } from "./src/config/db.js";

const monthlyMaintenance = async () => {
    try {
        await pool.query(`UPDATE loan_emis SET status = 'OVERDUE' WHERE status = 'PENDING' AND due_date < CURRENT_DATE;`);
        await pool.query(
            `UPDATE loans l SET next_due_date = COALESCE(
                (SELECT MIN(e.due_date) FROM loan_emis e WHERE e.loan_id = l.id AND e.status <> 'PAID'), l.next_due_date)
             WHERE l.status = 'ACTIVE';`
        );
    } catch (e) {
        console.error("Loan maintenance failed:", e);
    }
};
monthlyMaintenance();
setInterval(monthlyMaintenance, 24 * 60 * 60 * 1000);

const { setEmiInterval } = await import("./src/services/emiScheduler.js");
const envSeconds = Number(process.env.EMI_INTERVAL_SECONDS);
setEmiInterval(Number.isFinite(envSeconds) && envSeconds > 0 ? envSeconds : 0);





app.listen(PORT, () => console.log(`Loan Service is running on port ${PORT}`));