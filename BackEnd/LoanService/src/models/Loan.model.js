import { pool } from "../config/db.js";

// NOTE: despite the "Model.js" filename (matching Branch.model.js's
// naming), this is plain pool.query() functions, not a Sequelize/Mongoose
// model — consistent with how AccountService does everything via raw SQL
// in its controller. If Branch.model.js turns out to actually be an ORM
// model, this file will look inconsistent with it; let me know and I'll
// adjust.

export const getLoanTypeById = async (loanTypeId) => {
    const result = await pool.query(
        `SELECT * FROM loan_types WHERE id = $1 AND is_active = true LIMIT 1;`,
        [loanTypeId]
    );
    return result.rows[0] || null;
};

export const getCustomerByUserId = async (userId) => {
    const result = await pool.query(
        `SELECT id FROM customers WHERE user_id = $1 LIMIT 1;`,
        [userId]
    );
    return result.rows[0] || null;
};

export const insertLoanApplication = async (client, data) => {
    const {
        userId, customerId, loanTypeId, employmentType, requestedAmount,
        tenureMonths, purpose, monthlyIncome, collateralDescription, status,
    } = data;

    const result = await client.query(
        `INSERT INTO loan_applications (
            user_id, customer_id, loan_type_id, employment_type, requested_amount,
            tenure_months, purpose, monthly_income, collateral_description, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *;`,
        [
            userId, customerId, loanTypeId, employmentType, requestedAmount,
            tenureMonths, purpose, monthlyIncome, collateralDescription || null, status,
        ]
    );
    return result.rows[0];
};

export const insertLoanDocument = async (client, loanApplicationId, documentType, filePath) => {
    const result = await client.query(
        `INSERT INTO loan_documents (loan_application_id, document_type, file_path)
         VALUES ($1, $2, $3)
         RETURNING *;`,
        [loanApplicationId, documentType, filePath]
    );
    return result.rows[0];
};

export const getLoanApplicationsByCustomer = async (customerId) => {
    const result = await pool.query(
        `SELECT la.*, lt.name AS loan_type_name, lt.category
         FROM loan_applications la
         JOIN loan_types lt ON lt.id = la.loan_type_id
         WHERE la.customer_id = $1
         ORDER BY la.created_at DESC;`,
        [customerId]
    );
    return result.rows;
};

export const getLoanApplicationById = async (applicationId) => {
    const result = await pool.query(
        `SELECT * FROM loan_applications WHERE id = $1 LIMIT 1;`,
        [applicationId]
    );
    return result.rows[0] || null;
};

export const getAllLoanTypes = async () => {
    const result = await pool.query(
        `SELECT * FROM loan_types WHERE is_active = true ORDER BY category, name;`
    );
    return result.rows;
};

export const getDocumentsByApplicationId = async (applicationId) => {
    const result = await pool.query(
        `SELECT * FROM loan_documents WHERE loan_application_id = $1;`,
        [applicationId]
    );
    return result.rows;
};