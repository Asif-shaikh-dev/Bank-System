import "./env.js"; // must run before we read process.env below
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const connectDb = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("PostgreSQL connected successfully (LoanService)");
    } catch (error) {
        console.error("PostgreSQL connection failed:", error);
        process.exit(1);
    }
};

export { pool };
export default connectDb;