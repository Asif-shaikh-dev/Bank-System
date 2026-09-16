import axios from 'axios';
import { DEMO_USER_ID } from '../../utils/constants';

const ACCOUNT_SERVICE_URL = import.meta.env.VITE_ACCOUNT_SERVICE_URL;
console.log(`Using Account Service URL: ${ACCOUNT_SERVICE_URL}`);

const accountApi = {
    getAccounts: async () => {
        try {
            const response = await axios.get(`${ACCOUNT_SERVICE_URL}/accounts`);
            return response.data;
        } catch (error) {
            console.error('Error fetching accounts:', error);
            throw error;
        }
    },

    getAccountById: async (id) => {
        try {
            const response = await axios.get(`${ACCOUNT_SERVICE_URL}/accounts/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching account with ID ${id}:`, error);
            throw error;
        }
    },
    createAccount: async (accountData) => {
        try {
            const response = await axios.post(
                `${ACCOUNT_SERVICE_URL}/onboarding/apply`,
                accountData,
            
            );
            return response.data;
        } catch (error) {
            console.error('Error creating account:', error);
            throw error;
        }
    },

    updateAccount: async (id, accountData) => {
        try {
            const response = await axios.put(`${ACCOUNT_SERVICE_URL}/accounts/${id}`, accountData);
            return response.data;
        } catch (error) {
            console.error(`Error updating account with ID ${id}:`, error);
            throw error;
        }
    },

    deleteAccount: async (id) => {
        try {
            const response = await axios.delete(`${ACCOUNT_SERVICE_URL}/accounts/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting account with ID ${id}:`, error);
            throw error;
        }
    },
};

// ---------------------------------------------------------------------
// TEMP demo data — the real `accounts` table has 0 rows right now
// (accounts only get provisioned once an onboarding application is
// APPROVED, and none have been approved yet). These let Accounts.jsx,
// AccountDetails.jsx and Profile.jsx render something real-shaped
// while that backend piece gets built. Delete this whole block, and
// point callers back at getAccounts()/getAccountById() above, once
// approved applications actually create rows here.
// ---------------------------------------------------------------------

const MOCK_ACCOUNTS = [
  {
    id: 1,
    customer_id: 32,
    account_number: "409000123456789",
    balance: 284650.75,
    account_type: "SAVINGS",
    account_scheme: "Regular Savings Account",
  },
  {
    id: 2,
    customer_id: 32,
    account_number: "409000998877665",
    balance: 500000,
    account_type: "FIXED_DEPOSIT",
    account_scheme: "5-Year FD @ 7.25%",
  },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

accountApi.getMyAccountsDemo = async (customerId = DEMO_USER_ID) => {
  await delay();
  return MOCK_ACCOUNTS.filter((a) => a.customer_id === customerId);
};

accountApi.getAccountByIdDemo = async (accountId) => {
  await delay();
  return MOCK_ACCOUNTS.find((a) => String(a.id) === String(accountId)) ?? null;
};

export default accountApi;