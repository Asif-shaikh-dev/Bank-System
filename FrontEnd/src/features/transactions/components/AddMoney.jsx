import { useState } from "react";
import { toast } from "react-toastify";
import { addMoney } from "../transaction.api";
import { useAuth } from "../../../store/AuthContext";

export default function AddMoney({ accountId, onDone }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const balance = await addMoney({ accountId, amount: Number(amount), user });
      toast.success(`Money added. New balance ₹${balance.toLocaleString("en-IN")}`);
      setAmount("");
      onDone?.(balance);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (₹)"
        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
      />
      <button
        onClick={submit}
        disabled={busy || !amount}
        className="rounded-md bg-[#0F2440] px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {busy ? "Processing..." : "Add money"}
      </button>
    </div>
  );
}