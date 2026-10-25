import createApiClient from "../../services/apiClient";

const client = createApiClient(`${import.meta.env.VITE_TRANSACTION_SERVICE_URL}/transaction`);

const loadCheckoutScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("Could not load Razorpay checkout."));
    document.body.appendChild(s);
  });

// Opens Razorpay checkout; resolves with the new balance, rejects if the user closes it.
export async function addMoney({ accountId, amount, user }) {
  await loadCheckoutScript();
  const { data: order } = (await client.post("/topup/order", { account_id: accountId, amount })).data;

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: "NexusBank",
      description: "Add money to account",
      prefill: { name: user?.name, email: user?.email },
      theme: { color: "#0F2440" },
      handler: async (response) => {
        try {
          const res = await client.post("/topup/verify", response);
          resolve(res.data.data.balance);
        } catch (e) {
          reject(e);
        }
      },
      modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
    });
    checkout.on("payment.failed", (r) => reject(new Error(r.error?.description || "Payment failed.")));
    checkout.open();
  });
}

export const getAccountTransactions = (accountId) =>
  client.get(`/account/${accountId}`).then((r) => r.data.data);