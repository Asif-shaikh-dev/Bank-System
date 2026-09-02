import React, { useState } from "react";
import Navbar from "../../../components/common/Navbar";

// Point this at your backend. Endpoints below assume:
//   POST {API_BASE_URL}/auth/register  -> { email_id, phone_no, name, password }
//   POST {API_BASE_URL}/auth/login     -> { email_id, password }
// Adjust the paths if your API uses different routes.
const API_BASE_URL = "http://localhost:2000/api";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loginData, setLoginData] = useState({ email_id: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email_id: "",
    phone_no: "",
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      setSuccess("Logged in successfully.");
      // e.g. store token: localStorage.setItem("token", data.token);
      console.log("Login success:", data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      setSuccess("Account created. You can now log in.");
      setRegisterData({ email_id: "", phone_no: "", name: "", password: "" });
      setTimeout(() => switchMode("login"), 1200);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    
    <Navbar />
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
       
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`py-4 text-sm font-medium transition-colors ${
              mode === "login"
                ? "border-b-2 border-teal-600 text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`py-4 text-sm font-medium transition-colors ${
              mode === "register"
                ? "border-b-2 border-teal-600 text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Register
          </button>
        </div>

        <div className="px-8 py-8">
          <h2 className="text-xl font-semibold text-slate-900">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login"
              ? "Log in to access your dashboard."
              : "Fill in your details to get started."}
          </p>

          {error && (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* ---- Login form ---- */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email_id"
                  value={loginData.email_id}
                  onChange={handleLoginChange}
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-sm text-slate-500">
                Not registered?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-medium text-teal-700 hover:underline"
                >
                  Register here
                </button>
              </p>
            </form>
          )}

          {/* ---- Register form ---- */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="register-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>
                <input
                  type="text"
                  id="register-name"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  placeholder="Salman Jamir Shaikh"
                />
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="register-email"
                  name="email_id"
                  value={registerData.email_id}
                  onChange={handleRegisterChange}
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="register-phone"
                  className="block text-sm font-medium text-slate-700"
                >
                  Phone number
                </label>
                <input
                  type="tel"
                  id="register-phone"
                  name="phone_no"
                  value={registerData.phone_no}
                  onChange={handleRegisterChange}
                  required
                  pattern="[0-9]{10,15}"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  placeholder="5566778899"
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="register-password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  minLength={6}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Register"}
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-medium text-teal-700 hover:underline"
                >
                  Login here
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
    
    </>
  );
}