export const ONBOARDING_STATUS = {
    PENDING_REVIEW: "PENDING_REVIEW",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
  };
  
  export const ONBOARDING_STATUS_LABEL = {
    PENDING_REVIEW: "Under review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  
  export const ACCOUNT_TYPE_LABEL = {
    SAVINGS: "Savings Account",
    SALARY: "Salary Account",
    CURRENT: "Current Account",
    FIXED_DEPOSIT: "Fixed Deposit",
    RD: "Recurring Deposit",
  };
  
  // TEMP: AuthContext's silent-refresh (restoreSession) never calls
  // setUser(), so `user` from useAuth() is null after a page reload —
  // only login() populates it, and only if the login response includes
  // userData. Every "my data" screen falls back to this id so the demo
  // arrays in profile.api.js / account.api.js have something concrete
  // to filter by. Delete this the moment AuthContext exposes a real
  // user_id (decode the access token, or add a GET /me call).
  export const DEMO_USER_ID = 32;