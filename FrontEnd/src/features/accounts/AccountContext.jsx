import { createContext, useContext, useState } from "react";

const AccountContext = createContext(undefined);

export function AccountProvider({ children }) {
  // Set when the user clicks a scheme card on the dashboard (e.g. "SAVINGS").
  // Treated as locked on the open-account form — the user already chose this.
  const [accountType, setAccountType] = useState(null);
 

  // Set alongside accountType as a default, but the user can still
  // change it on the open-account form (e.g. Regular vs Women's savings).
  const [accountScheme, setAccountScheme] = useState(null);

  const value = { accountType, setAccountType, accountScheme, setAccountScheme };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}