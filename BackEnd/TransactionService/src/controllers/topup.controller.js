import crypto from "crypto";
import Razorpay from "razorpay";
import { pool } from "../config/db.js";

const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /transaction/topup/order   { account_id, amount }
export const createTopupOrder = async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        const accountId = parseInt(req.body.account_id, 10);

        if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
            return res.status(400).json({ success: false, message: "Amount must be between ₹1 and ₹1,00,000." });
        }

        // The account must belong to the logged-in user
        const own = await pool.query(
            `SELECT a.id FROM accounts a JOIN customers c ON c.id = a.customer_id
             WHERE a.id = $1 AND c.user_id = $2;`,
            [accountId, req.user.id]
        );
        if (own.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        const order = await rzp.orders.create({
            amount: Math.round(amount * 100), // paise
            currency: "INR",
            receipt: `topup_${accountId}_${Date.now()}`,
        });

        await pool.query(
            `INSERT INTO payments (user_id, account_id, order_id, amount, currency, status, purpose)
             VALUES ($1,$2,$3,$4,'INR','CREATED','TOPUP');`,
            [req.user.id, accountId, order.id, amount]
        );

        return res.status(201).json({
            success: true,
            data: { order_id: order.id, amount: order.amount, currency: order.currency, key_id: process.env.RAZORPAY_KEY_ID },
        });
    } catch (error) {
        console.error("Create order failed:", error);
        return res.status(500).json({ success: false, message: "Could not start the payment." });
    }
};

// POST /transaction/topup/verify   { razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyTopup = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: "Missing payment details." });
    }

    // Money is only credited if this signature matches. Never trust the browser's "success" alone.
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(String(razorpay_signature));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(400).json({ success: false, message: "Payment signature verification failed." });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const p = (await client.query(
            `SELECT * FROM payments WHERE order_id = $1 AND user_id = $2 FOR UPDATE;`,
            [razorpay_order_id, req.user.id]
        )).rows[0];
        if (!p) {
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        // Idempotent: a retry or double-click won't credit twice
        if (p.status === "PAID") {
            const bal = await client.query(`SELECT balance FROM accounts WHERE id = $1;`, [p.account_id]);
            await client.query("COMMIT");
            return res.status(200).json({ success: true, message: "Already credited.", data: { balance: Number(bal.rows[0].balance) } });
        }

        await client.query(
            `UPDATE payments SET status = 'PAID', payment_id = $2, updated_at = NOW() WHERE id = $1;`,
            [p.id, razorpay_payment_id]
        );

        const acc = await client.query(
            `UPDATE accounts SET balance = COALESCE(balance, 0) + $1 WHERE id = $2 RETURNING balance;`,
            [p.amount, p.account_id]
        );
        const newBalance = acc.rows[0].balance;

        await client.query(
            `INSERT INTO transactions (account_id, type, amount, balance_after, description, reference)
             VALUES ($1,'CREDIT',$2,$3,$4,$5);`,
            [p.account_id, p.amount, newBalance, "Money added via Razorpay", razorpay_payment_id]
        );

        await client.query("COMMIT");
        return res.status(200).json({ success: true, message: "Money added.", data: { balance: Number(newBalance) } });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Verify top-up failed:", error);
        return res.status(500).json({ success: false, message: "Could not record the payment." });
    } finally {
        client.release();
    }
};

// GET /transaction/account/:accountId
export const getAccountTransactions = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.id, t.type, t.amount, t.balance_after, t.description, t.created_at
             FROM transactions t
             JOIN accounts a ON a.id = t.account_id
             JOIN customers c ON c.id = a.customer_id
             WHERE t.account_id = $1 AND c.user_id = $2
             ORDER BY t.created_at DESC LIMIT 50;`,
            [req.params.accountId, req.user.id]
        );
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Fetch transactions failed:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch transactions." });
    }
};