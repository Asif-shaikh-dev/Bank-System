import { DEMO_USER_ID } from "../../utils/constants";

// TEMP in-memory mirror of the `onboarding_applications` table.
// This is the customer's real identity/KYC record right now — there's
// no separate `customers` table yet, so Personal Info reads from here.
//
// TODO: replace with `GET /api/onboarding/me` (AccountService) once
// that route exists. Field names match the Postgres columns exactly
// so swapping this out later is a find-and-replace, not a rewrite.
const MOCK_APPLICATIONS = [
  {
    id: 19,
    user_id: 32,
    name: "Asif Shaikh",
    email_id: "asifsk.5070@gmail.com",
    date_of_birth: "2008-09-02",
    pan_card_no: "ABCDE1234F",
    residential_address:
      "Vishalgad, Hingane Mai AS 89, Sasane Ngr, Nr Mantri, Pune 411028",
    employment_status: "Employed",
    source_of_income: "Investments",
    phone_no: "1234567899",
    aadhaar_no: "100000000001",
    risk_score: 1,
    status: "PENDING_REVIEW",
    created_at: "2026-09-10T12:52:13.181Z",
    updated_at: "2026-09-10T12:52:13.181Z",
    account_type: "SAVINGS",
    account_scheme: "Regular Savings Account",
  },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const profileApi = {
  // The logged-in customer's onboarding/KYC record.
  getMyApplicationDemo: async (userId = DEMO_USER_ID) => {
    await delay();
    return MOCK_APPLICATIONS.find((a) => a.user_id === userId) ?? null;
  },
};

export default profileApi;