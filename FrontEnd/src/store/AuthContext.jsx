import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import tokenService from "../services/tokenService";
import authApi from "../services/authApi";   // new import
const AUTH_SERVICE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL;
//   console.log(`Using Auth Service URL: ${AUTH_SERVICE_URL}`);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // true until we've checked whether an existing session can be restored
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((accessToken, userData = null) => {
    tokenService.setToken(accessToken);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    tokenService.clearToken();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // This is the key step: on every fresh page load / new tab, exchange
    // the httpOnly refreshToken cookie for a new access token before
    // rendering protected routes. The cookie survives reloads even
    // though the in-memory access token doesn't, so this is what keeps
    // the user logged in until the refresh token itself expires (7d)
    // or is revoked.
    async function restoreSession() {
      try {
        const { data } = await axios.post(
          `${AUTH_SERVICE_URL}/refreshToken`,
          {},
          { withCredentials: true }
        );
        if (!cancelled) {
          tokenService.setToken(data.accessToken);
          setIsAuthenticated(true);
        }
      } catch {
        // No valid refresh cookie (never logged in, expired, or revoked)
        if (!cancelled) {
          tokenService.clearToken();
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }


    restoreSession();

    const handleExpired = () => logout();
    window.addEventListener("session-expired", handleExpired);

    return () => {
      cancelled = true;
      window.removeEventListener("session-expired", handleExpired);
    };
  }, [logout]);

  
  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    authApi
      .get("/auth/me")
      .then(({ data }) => { if (!cancelled) setProfile(data.data); })
      .catch((err) => console.error("Failed to load profile:", err));
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout,profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an <AuthProvider>");
  return ctx;
}