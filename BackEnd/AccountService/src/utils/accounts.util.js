export async function generateAccountNumber(client) {
    let accountNumber;
    let exists = true;

    while (exists) {
        accountNumber =
            Math.floor(100000000000 + Math.random() * 900000000000)
            .toString();

        const result = await client.query(
            `SELECT id FROM accounts WHERE account_number = $1`,
            [accountNumber]
        );

        exists = result.rows.length > 0;
    }

    return accountNumber;
}


export async function duplicateApplicationCheck(client, aadhaar_no, userId) {
    try {
        const result = await client.query(
            `SELECT id FROM onboarding_applications WHERE aadhaar_no = $1 OR user_id = $2 LIMIT 1;`,
            [aadhaar_no, userId]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking duplicate application:', error);
        throw error;
    }
}

// Converts an absolute filesystem path (possibly Windows-style, with
// backslashes) into a URL the frontend can actually load via the
// static route above. Splitting on both separators keeps this working
// regardless of whether this ever runs on Linux vs Windows.
export const toDocumentUrl = (fullPath) => {
    if (!fullPath) return null;
    const filename = fullPath.split(/[/\\]/).pop();
    return `/uploads/${filename}`;
  };


export const getOrCreateCustomer = async (client, userId, aadhaarNo, applicationId) => {
    const existing = await client.query(
        `SELECT id FROM customers WHERE user_id = $1 LIMIT 1;`,
        [userId]
    );
    if (existing.rows[0]) return existing.rows[0].id;

    const created = await client.query(
        `INSERT INTO customers (user_id, aadhaar_no, onboarding_application_id)
         VALUES ($1, $2, $3) RETURNING id;`,
        [userId, aadhaarNo, applicationId]
    );
    return created.rows[0].id;
};