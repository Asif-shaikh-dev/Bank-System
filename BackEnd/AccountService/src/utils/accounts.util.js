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