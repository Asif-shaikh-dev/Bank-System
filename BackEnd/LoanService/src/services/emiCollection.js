import { pool } from "../config/db.js";

const round2 = (n) => Math.round(n * 100) / 100;

// Collects one EMI from the customer's disbursement account into the treasury.
// Returns "PAID", "OVERDUE" or "SKIPPED".
const collectOne = async (emiId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const e = (await client.query(
            `SELECT e.*, l.disbursement_account_id AS account_id
             FROM loan_emis e JOIN loans l ON l.id = e.loan_id
             WHERE e.id = $1 FOR UPDATE OF e;`,
            [emiId]
        )).rows[0];
        if (!e || e.status === "PAID") {
            await client.query("ROLLBACK");
            return { result: "SKIPPED" };
        }

        const emi = Number(e.emi_amount);

                // No funds check: the account is allowed to go negative (overdrawn)
                const newBal = (await client.query(
                    `UPDATE accounts SET balance = COALESCE(balance, 0) - $1 WHERE id = $2 RETURNING balance;`,
                    [emi, e.account_id]
                )).rows[0].balance;

                await client.query(
                    `INSERT INTO transactions (account_id, type, amount, balance_after, description, reference)
                    VALUES ($1, 'DEBIT', $2, $3, $4, $5);`,
                    [
                        e.account_id, emi, newBal,
                        `Loan EMI ${e.emi_number} (loan #${e.loan_id})${Number(newBal) < 0 ? " - account overdrawn" : ""}`,
                        `EMI-${e.loan_id}-${e.emi_number}`,
                    ]
                );

        await client.query(`UPDATE loan_emis SET status = 'PAID', paid_at = NOW() WHERE id = $1;`, [emiId]);

        // Treasury gets the whole EMI back: principal returns, interest is income
        const interest = Number(e.interest_component);
        const principal = Number(e.principal_component);
        const tBal = Number((await client.query(
            `UPDATE bank_treasury SET balance = balance + $1, updated_at = NOW() WHERE id = 1 RETURNING balance;`,
            [emi]
        )).rows[0].balance);

        const ref = `EMI-${e.loan_id}-${e.emi_number}`;
        await client.query(
            `INSERT INTO treasury_ledger (type, amount, balance_after, reference, description)
             VALUES ('EMI_PRINCIPAL', $1, $2, $4, $5), ('EMI_INTEREST', $3, $6, $4, $7);`,
            [principal, round2(tBal - interest), interest, ref,
             `Principal, EMI ${e.emi_number} of loan #${e.loan_id}`, tBal, `Interest, EMI ${e.emi_number} of loan #${e.loan_id}`]
        );

        await client.query(
            `UPDATE loans l SET
               next_due_date = COALESCE((SELECT MIN(due_date) FROM loan_emis WHERE loan_id = l.id AND status <> 'PAID'), l.next_due_date),
               status = CASE WHEN NOT EXISTS (SELECT 1 FROM loan_emis WHERE loan_id = l.id AND status <> 'PAID')
                             THEN 'CLOSED' ELSE l.status END
             WHERE l.id = $1;`,
            [e.loan_id]
        );

        await client.query("COMMIT");
        return { result: "PAID", amount: emi, interest };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// asOf (optional, "YYYY-MM-DD") lets you simulate a later date for demos.
// demo=true  : collect the NEXT unpaid EMI of every active loan, ignoring due dates
// demo=false : collect EMIs whose due_date has really arrived (optionally as of a simulated date)
export const collectDueEmis = async (asOf = null, { demo = false } = {}) => {
    const due = demo
        ? await pool.query(
            `SELECT DISTINCT ON (e.loan_id) e.id, e.loan_id
             FROM loan_emis e JOIN loans l ON l.id = e.loan_id
             WHERE l.status = 'ACTIVE' AND e.status IN ('PENDING','OVERDUE')
             ORDER BY e.loan_id, e.emi_number;`
        )
        : await pool.query(
            `SELECT e.id, e.loan_id
             FROM loan_emis e JOIN loans l ON l.id = e.loan_id
             WHERE l.status = 'ACTIVE' AND e.status IN ('PENDING','OVERDUE')
               AND e.due_date <= COALESCE($1::date, CURRENT_DATE)
             ORDER BY e.loan_id, e.emi_number;`,
            [asOf]
        );

    const summary = { collected: 0, overdue: 0, total_collected: 0, interest_earned: 0 };
    const blocked = new Set();

    for (const row of due.rows) {
        if (blocked.has(row.loan_id)) continue;
        const r = await collectOne(row.id);
        if (r.result === "PAID") {
            summary.collected++;
            summary.total_collected = round2(summary.total_collected + r.amount);
            summary.interest_earned = round2(summary.interest_earned + r.interest);
        } else if (r.result === "OVERDUE") {
            summary.overdue++;
            blocked.add(row.loan_id);
        }
    }
    return summary;
};