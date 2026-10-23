import axios from "axios";
import tokenService from "./tokenService";

// AuthService is the only service that owns /refreshToken — every other
// service's axios instance still needs to call back here on a 401,
// since LoanService (and any future service) only verifies tokens,
// it doesn't issue them.
const AUTH_SERVICE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:2000/api";

// Deliberately module-level (shared across every instance this factory
// creates), not per-instance. If a page fires a LoanService call and an
// AccountService call at the same moment and both get a 401, we want
// ONE refresh request, not two racing each other.
let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

/**
 * Creates an axios instance that:
 *  - attaches the in-memory access token as a Bearer header
 *  - on a 401, silently refreshes via AuthService and retries once
 *  - queues concurrent 401s behind a single in-flight refresh
 *
 * This is authApi.js's interceptor logic, pulled out so any service
 * client (loan, insurance, transactions, ...) can reuse it instead of
 * re-implementing the same refresh dance. authApi.js itself still has
 * its own copy — I left it untouched rather than risk changing a file
 * that's already working; consider migrating it to use this factory
 * too, later, so there's only one copy of this logic.
 */
export default function createApiClient(baseURL) {
  const client = axios.create({ baseURL, withCredentials: true });

  client.interceptors.request.use((config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const isAuthEndpoint = originalRequest?.url?.includes("/refreshToken");

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingQueue.push({ resolve, reject });
          }).then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post(
            `${AUTH_SERVICE_URL}/refreshToken`,
            {},
            { withCredentials: true }
          );

          tokenService.setToken(data.accessToken);
          flushQueue(null, data.accessToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          flushQueue(refreshError, null);
          tokenService.clearToken();
          window.dispatchEvent(new Event("session-expired"));
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}