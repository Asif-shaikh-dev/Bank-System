import axios from "axios";

const ACCOUNT_SERVICE_URL =
  import.meta.env.VITE_ACCOUNT_SERVICE_URL || "http://localhost:1000/api";

// "/uploads/..." URLs from the backend are relative to the AccountService
// origin, not the "/api" prefix — strip it once here so components can
// just do `${ACCOUNT_SERVICE_ORIGIN}${doc_url}`.
export const ACCOUNT_SERVICE_ORIGIN = ACCOUNT_SERVICE_URL.replace(/\/api\/?$/, "");

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

export default adminApi;