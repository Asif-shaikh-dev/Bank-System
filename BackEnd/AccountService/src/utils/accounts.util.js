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