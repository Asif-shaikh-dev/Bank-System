import axios from "axios";
import tokenService from "./tokenService";

// e.g. http://localhost:2000/api
const AUTH_SERVICE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:2000/api";

const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  withCredentials: true, // required so the httpOnly refreshToken cookie is sent
});

// Attach the current in-memory access token to every outgoing request
authApi.interceptors.request.use((config) => {
  const token = tokenService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Silent refresh on 401, with a queue so concurrent requests don't
// each trigger their own refresh call ---
let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest?.url?.includes("/refreshToken");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Another request already triggered a refresh — wait for it
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return authApi(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Plain axios here, not authApi — we don't want this call itself
        // recursively hitting this same interceptor
        const { data } = await axios.post(
          `${AUTH_SERVICE_URL}/refreshToken`,
          {},
          { withCredentials: true }
        );

        tokenService.setToken(data.accessToken);
        flushQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        tokenService.clearToken();
        // AuthProvider listens for this and flips the app back to "logged out"
        window.dispatchEvent(new Event("session-expired"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default authApi;