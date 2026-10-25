import axios from "axios";

const ACCOUNT_SERVICE_URL =
  import.meta.env.VITE_ACCOUNT_SERVICE_URL || "http://localhost:1000/api";

// "/uploads/..." URLs from the backend are relative to the AccountService
// origin, not the "/api" prefix — strip it once here so components can
// just do `${ACCOUNT_SERVICE_ORIGIN}${doc_url}`.
export const ACCOUNT_SERVICE_ORIGIN = ACCOUNT_SERVICE_URL.replace(/\/api\/?$/, "");
const LOAN_SERVICE_URL = import.meta.env.VITE_LOAN_SERVICE_URL || "http://localhost:6100";

const adminApi = axios.create({
  baseURL: `${ACCOUNT_SERVICE_URL}/admin`,
  withCredentials: true,
});

export const getPendingOnboardingApplications = () =>
  adminApi.get("/getOnboardingList");

export const approveOnboardingApplication = (id) =>
  adminApi.post(`/OnboardingList/approve/${id}`);

export const rejectOnboardingApplication = (id) =>
  adminApi.post(`/OnboardingList/reject/${id}`);


export const LOAN_SERVICE_ORIGIN = LOAN_SERVICE_URL;

const loanAdminApi = axios.create({ baseURL: `${LOAN_SERVICE_URL}/loan/admin` });

export const getPendingLoanApplications = () => loanAdminApi.get("/pending");
export const approveLoanApplication = (id, interestRate) =>
  loanAdminApi.post(`/${id}/approve`, { interest_rate: interestRate });
export const rejectLoanApplication = (id, reason) =>
  loanAdminApi.post(`/${id}/reject`, { reason });

export const getAccountHolders = () => adminApi.get("/account-holders");
export const getAadhaarRecords = () => adminApi.get("/kyc/aadhaar");
export const addAadhaarRecord = (body) => adminApi.post("/kyc/aadhaar", body);
export const getPanRecords = () => adminApi.get("/kyc/pan");
export const addPanRecord = (body) => adminApi.post("/kyc/pan", body);

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_SERVICE_URL || "http://localhost:7000";
const txAdminApi = axios.create({ baseURL: `${TRANSACTION_SERVICE_URL}/transaction/admin` });
export const getAllTransactions = () => txAdminApi.get("/all");


export const getTreasury = () => txAdminApi.get("/treasury");
export const runEmiCollection = (asOf) => loanAdminApi.post("/collect-emis", asOf ? { as_of: asOf } : {});

export const getEmiInterval = () => loanAdminApi.get("/emi-interval");
export const setEmiIntervalApi = (seconds) => loanAdminApi.post("/emi-interval", { seconds });

export default adminApi;