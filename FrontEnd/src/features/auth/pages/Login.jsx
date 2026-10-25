import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authApi from "../../../services/authApi";
import { useAuth } from "../../../store/AuthContext";


// Re-enable these two lines in your project — commented out here so this
// file can render standalone as a preview.
// import Navbar from "../../../components/common/Navbar";

// Point this at your backend. Endpoints below assume:
//   POST {API_BASE_URL}/auth/register  -> { email_id, phone_no, name, password }
//   POST {API_BASE_URL}/auth/login     -> { email_id, password }
const API_BASE_URL = import.meta.env.VITE_AUTH_SERVICE_URL;
// console.log(`Using Auth Service URL: ${API_BASE_URL}`);

const COPY = {
  login: {
    headline: "Pick up right where you left off.",
    body: "Your projects, notes and settings are exactly where you left them.",
  },
  register: {
    headline: "Let's get you set up.",
    body: "A couple of details and you're in — no lengthy forms, we promise.",
  },
};

export default function AuthPage() {
  const {login} = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loginData, setLoginData] = useState({ email_id: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email_id: "",
    phone_no: "",
    name: "",
    password: "",
  });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
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
      const { data } = await authApi.post("/auth/login", loginData);

      // authApi already has withCredentials: true, so the refreshToken
      // cookie from the response is stored by the browser automatically —
      // no need to touch headers or credentials here.
      login(data.accessToken, data.user ?? null);

      setSuccess("Logged in successfully.");
      navigate("/"); // or wherever your post-login landing page is
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
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
      await authApi.post("/auth/register", registerData);

      setSuccess("Account created. You can now log in.");
      setRegisterData({ email_id: "", phone_no: "", name: "", password: "" });
      setTimeout(() => switchMode("login"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = COPY[mode];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

        .auth-shell, .auth-shell * { box-sizing: border-box; }
        .auth-shell {
          --ink: #0B2B26;
          --ink-2: #123832;
          --coral: #FF6B4A;
          --coral-dark: #E24E2C;
          --paper: #FBFAF8;
          --ink-text: #16231F;
          --muted: #6E7C77;
          --border: #E4E0D6;
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', sans-serif;
          background: var(--paper);
        }

        .auth-panel-brand {
          flex: 0 0 42%;
          position: relative;
          overflow: hidden;
          padding: 56px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(160deg, var(--ink) 0%, var(--ink-2) 100%);
          color: #fff;
        }
        .auth-blob {
          position: absolute;
          width: 420px;
          height: 420px;
          right: -140px;
          bottom: -160px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,107,74,0.55), rgba(255,196,155,0.18) 55%, transparent 70%);
          filter: blur(50px);
          animation: blobMove 16s ease-in-out infinite;
        }
        @keyframes blobMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(24px, -18px) scale(1.1); }
        }

        .auth-mark {
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, var(--coral), #FFC49B);
          transform: rotate(45deg);
          border-radius: 3px;
          position: relative;
          z-index: 1;
        }

        .auth-brand-copy { position: relative; z-index: 1; max-width: 380px; }
        .auth-headline {
          font-family: 'Instrument Serif', serif;
          font-size: 2.15rem;
          line-height: 1.18;
          margin: 0 0 14px;
          font-weight: 400;
        }
        .auth-body-text {
          font-size: 14.5px;
          line-height: 1.6;
          color: rgba(255,255,255,0.72);
          margin: 0;
        }
        .auth-brand-copy.anim { animation: brandIn 420ms cubic-bezier(.16,1,.3,1); }
        @keyframes brandIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-panel-form {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
        .auth-form-inner { width: 100%; max-width: 400px; }

        .tabswitch {
          position: relative;
          display: flex;
          height: 46px;
          border-radius: 999px;
          background: #F1EEE7;
          overflow: hidden;
          margin-bottom: 32px;
        }
        .tabswitch button {
          flex: 1;
          position: relative;
          z-index: 1;
          background: transparent;
          border: none;
          font: inherit;
          font-weight: 600;
          font-size: 14px;
          color: var(--muted);
          cursor: pointer;
          transition: color 220ms ease;
        }
        .tabswitch button.is-active { color: #fff; }
        .tab-indicator {
          position: absolute;
          top: 0; left: 0;
          width: 50%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--coral), var(--coral-dark));
          transition: transform 340ms cubic-bezier(.65,0,.35,1);
        }
        .tab-indicator.pos-register { transform: translateX(100%); }
        .tab-indicator.pos-login { transform: translateX(0%); }

        .auth-heading { margin: 0 0 4px; font-size: 20px; font-weight: 700; color: var(--ink-text); }
        .auth-subheading { margin: 0 0 24px; font-size: 14px; color: var(--muted); }

        .auth-alert {
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13.5px;
          margin-bottom: 18px;
          animation: brandIn 260ms ease;
        }
        .auth-alert-error { background: #FDECEA; color: #B3261E; border: 1px solid #F3C7C2; }
        .auth-alert-success { background: #EAF6EE; color: #1E7A3D; border: 1px solid #C3E6CE; }

        .auth-form.anim { animation: formIn 320ms cubic-bezier(.16,1,.3,1); }
        @keyframes formIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .field { margin-bottom: 16px; }
        .field label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink-text);
        }
        .input-wrap { position: relative; }
        .field input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: #fff;
          font-size: 14px;
          color: var(--ink-text);
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        .field input:focus {
          outline: none;
          border-color: var(--coral);
          box-shadow: 0 0 0 4px rgba(255,107,74,0.12);
        }
        .field input.has-toggle { padding-right: 42px; }
        .pw-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          border-radius: 6px;
          transition: color 180ms ease;
        }
        .pw-toggle:hover { color: var(--ink-text); }

        .auth-submit {
          width: 100%;
          padding: 13px;
          margin-top: 4px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--coral), var(--coral-dark));
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 150ms ease, box-shadow 200ms ease, opacity 150ms ease;
        }
        .auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(255,107,74,0.28);
        }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .auth-switch-line {
          text-align: left;
          margin-top: 20px;
          font-size: 13.5px;
          color: var(--muted);
        }
        .auth-switch-line button {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          font-weight: 600;
          color: var(--coral-dark);
          cursor: pointer;
        }
        .auth-switch-line button:hover { text-decoration: underline; }

        .auth-shell button:focus-visible,
        .auth-shell input:focus-visible {
          outline: 2px solid var(--coral);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-shell * { animation: none !important; transition: none !important; }
        }

        @media (max-width: 860px) {
          .auth-shell { flex-direction: column; }
          .auth-panel-brand { flex: 0 0 auto; padding: 36px 28px; min-height: 200px; }
          .auth-headline { font-size: 1.5rem; }
          .auth-blob { width: 280px; height: 280px; }
          .auth-panel-form { padding: 32px 20px; }
        }
      `}</style>

      {/* <Navbar /> */}

      <div className="auth-shell">
        <div className="auth-panel-brand">
          <div className="auth-mark" />
          <div className="auth-blob" />
          <div className="auth-brand-copy anim" key={mode}>
            <h1 className="auth-headline">{copy.headline}</h1>
            <p className="auth-body-text">{copy.body}</p>
          </div>
        </div>

        <div className="auth-panel-form">
          <div className="auth-form-inner">
            <div className="tabswitch">
              <button
                type="button"
                className={mode === "login" ? "is-active" : ""}
                onClick={() => switchMode("login")}
              >
                Log in
              </button>
              <button
                type="button"
                className={mode === "register" ? "is-active" : ""}
                onClick={() => switchMode("register")}
              >
                Register
              </button>
              <div
                className={`tab-indicator ${mode === "login" ? "pos-login" : "pos-register"}`}
              />
            </div>

            <h2 className="auth-heading">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="auth-subheading">
              {mode === "login"
                ? "Log in to access your dashboard."
                : "Fill in your details to get started."}
            </p>

            {error && <div className="auth-alert auth-alert-error">{error}</div>}
            {success && <div className="auth-alert auth-alert-success">{success}</div>}

            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="auth-form anim" key="login-form">
                <div className="field">
                  <label htmlFor="login-email">Email</label>
                  <div className="input-wrap">
                    <input
                      type="email"
                      id="login-email"
                      name="email_id"
                      value={loginData.email_id}
                      onChange={handleLoginChange}
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="login-password">Password</label>
                  <div className="input-wrap">
                    <input
                      type={showLoginPw ? "text" : "password"}
                      id="login-password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                      placeholder="••••••••"
                      className="has-toggle"
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      onClick={() => setShowLoginPw((v) => !v)}
                      aria-label={showLoginPw ? "Hide password" : "Show password"}
                    >
                      {showLoginPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? "Logging in..." : "Log in"}
                </button>

                <p className="auth-switch-line">
                  Not registered?{" "}
                  <button type="button" onClick={() => switchMode("register")}>
                    Register here
                  </button>
                </p>
                <p className="auth-switch-line">
                  Admin?{" "}
                  <button type="button" onClick={() => navigate("/admin-login")}>
                    Login as admin
                  </button>
                </p>
              </form>
            )}

            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="auth-form anim" key="register-form">
                <div className="field">
                  <label htmlFor="register-name">Full name</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      id="register-name"
                      name="name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      required
                      placeholder="Enter Your Name"
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="register-email">Email</label>
                  <div className="input-wrap">
                    <input
                      type="email"
                      id="register-email"
                      name="email_id"
                      value={registerData.email_id}
                      onChange={handleRegisterChange}
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="register-phone">Phone number</label>
                  <div className="input-wrap">
                    <input
                      type="tel"
                      id="register-phone"
                      name="phone_no"
                      value={registerData.phone_no}
                      onChange={handleRegisterChange}
                      required
                      pattern="[0-9]{10,15}"
                      placeholder="89xxxxxx90"
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="register-password">Password</label>
                  <div className="input-wrap">
                    <input
                      type={showRegisterPw ? "text" : "password"}
                      id="register-password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="has-toggle"
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      onClick={() => setShowRegisterPw((v) => !v)}
                      aria-label={showRegisterPw ? "Hide password" : "Show password"}
                    >
                      {showRegisterPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </button>

                <p className="auth-switch-line">
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("login")}>
                    Log in here
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