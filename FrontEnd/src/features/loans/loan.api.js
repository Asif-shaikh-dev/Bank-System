import createApiClient from "../../services/apiClient";
//this is loan.api.js
// Matches the .env pattern: VITE_LOAN_SERVICE_URL has no /api suffix,
// and LoanService's app.js mounts routes at app.use("/loan", loanRouter)
// — so every call here needs the "/loan" segment added explicitly,
// unlike accountApi.js where "/api" is already baked into the base URL.
const LOAN_SERVICE_URL =
  import.meta.env.VITE_LOAN_SERVICE_URL || "http://localhost:6100";

  console.log("Loan service URL:", LOAN_SERVICE_URL);
console.log("Full API URL:", `${LOAN_SERVICE_URL}/loan/types`);

const loanClient = createApiClient(`${LOAN_SERVICE_URL}/loan`);

const loanApi = {
  // Public — no auth required (see loan.route.js: this sits above router.use(verifyToken))
  getLoanTypes: async () => {
    try {
      const response = await loanClient.get("/types");
      return response.data;
    } catch (error) {
      console.error("Error fetching loan types:", error);
      throw error;
    }
  },

  // formData must be a FormData instance (fields + up to 3 files:
  // income_proof, identity_proof, collateral_proof) — do NOT set a
  // Content-Type header manually, axios/browser sets the multipart
  // boundary automatically when the body is FormData.
  applyForLoan: async (formData) => {
    try {
      const response = await loanClient.post("/apply", formData);
      return response.data;
    } catch (error) {
      console.error("Error submitting loan application:", error);
      throw error;
    }
  },

  getMyApplications: async () => {
    try {
      const response = await loanClient.get("/my-applications");
      return response.data;
    } catch (error) {
      console.error("Error fetching loan applications:", error);
      throw error;
    }
  },

  getApplicationById: async (id) => {
    try {
      const response = await loanClient.get(`/application/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching loan application ${id}:`, error);
      throw error;
    }
  },
};

export default loanApi;