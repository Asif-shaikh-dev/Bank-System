import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

/*
bank_db=# CREATE DATABASE bank_db; iss command se database create hota to login karte time tere
databse ka naam daal for eg mera databse name hai bank_db;
CREATE DATABASE
bank_db=#


*/

const connectDb = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("PostgreSQL connected successfully");
    } catch (error) {
        console.error("PostgreSQL connection failed:", error);
        process.exit(1);
    }
};

connectDb();

async function getAccounts() {
    try {
        console.log('Connecting to bank_db...\n');

        // Run a simple query to get accounts with their names and balances
        const query = "SELECT account_no, name, account_balance, account_status FROM account where account_status = 'Active'";
        const result = await pool.query(query);

        // Print the results
        console.log('--- Account Data ---');
        console.table(result.rows);

    } catch (error) {
        console.error('Error executing query:', error.message);
    } finally {
        // Close the database connection pool
        await pool.end();
    }
}

getAccounts();