import { createContext, useContext, useState, useCallback } from "react";

const AdminContext = createContext(undefined);

const DEFAULT_BANK_STATS = {
  bankBudget: 2_450_000_000,
  totalInterestEarned: 186_400_000,
  totalProfit: 92_150_000,
  totalCustomers: 12840,
  totalAccounts: 15230,
  totalDeposits: 3_820_000_000,
  totalLoansIssued: 3204,
  totalLoanBook: 980_500_000,
  npaRatio: 2.3,
  monthlyGrowth: 4.8,
  pendingOnboarding: 0,
  pendingLoanApplications: 47,
  pendingInsuranceClaims: 19,
};

export function AdminProvider({ children }) {
  const [stats, setStats] = useState(DEFAULT_BANK_STATS);

  const updateStats = useCallback((patch) => {
    setStats((prev) => ({
      ...prev,
      ...patch,
    }));
  }, []);

  return (
    <AdminContext.Provider value={{ stats, setStats, updateStats }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);

  if (!ctx) {
    throw new Error("useAdmin must be used inside an <AdminProvider>");
  }

  return ctx;
}