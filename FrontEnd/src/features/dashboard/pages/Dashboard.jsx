import Navbar from "../../../components/common/Navbar";
export default function DashBoard() {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-16 text-center text-sm text-slate-400">
          Hover over Accounts, Loan, Insurance, Transactions, or Profile above ↑
          <br />
          (rest of the dashboard body goes here)
        </div>
      </div>
    );
  }