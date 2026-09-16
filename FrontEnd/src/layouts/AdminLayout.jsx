import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../features/admin/components/AdminSidebar";
import { AdminProvider } from "../features/admin/AdminContext";

export default function AdminLayout() {
  return (
    <AdminProvider>
      <div className="admin-shell">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

          .admin-shell, .admin-shell * { box-sizing: border-box; }
          .admin-shell {
            --ink: #0B2B26;
            --ink-2: #123832;
            --coral: #FF6B4A;
            --coral-dark: #E24E2C;
            --paper: #FBFAF8;
            --ink-text: #16231F;
            --muted: #6E7C77;
            --border: #E4E0D6;
            display: flex;
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
            background: var(--paper);
          }

          .admin-sidebar {
            width: 250px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            padding: 24px 16px;
            background: linear-gradient(160deg, var(--ink) 0%, var(--ink-2) 100%);
            color: #fff;
          }
          .admin-sidebar-brand { display: flex; align-items: center; gap: 9px; padding: 4px 10px 28px; }
          .admin-brand-mark {
            width: 15px; height: 15px; border-radius: 3px;
            background: linear-gradient(135deg, var(--coral), #FFC49B);
            transform: rotate(45deg);
            flex-shrink: 0;
          }
          .admin-brand-word { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 1.15rem; color: #fff; }
          .admin-brand-word .accent { font-family: 'Inter', sans-serif; font-style: normal; font-weight: 600; color: #FFC49B; margin-left: 3px; }

          .admin-sidebar-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
          .admin-nav-link {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-radius: 9px; text-decoration: none;
            font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.65);
            transition: background 180ms ease, color 180ms ease;
          }
          .admin-nav-link svg { flex-shrink: 0; }
          .admin-nav-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
          .admin-nav-link.is-active { background: rgba(255,107,74,0.16); color: #fff; }
          .admin-nav-link.is-active svg { color: var(--coral); }
          .admin-nav-soon {
            margin-left: auto; font-size: 9.5px; font-weight: 700; letter-spacing: 0.04em;
            text-transform: uppercase; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.75);
            padding: 2px 6px; border-radius: 999px;
          }

          .admin-logout-btn {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border: none; border-radius: 9px; background: transparent;
            color: rgba(255,255,255,0.65); font: inherit; font-size: 13.5px; font-weight: 500;
            cursor: pointer; transition: background 180ms ease, color 180ms ease;
          }
          .admin-logout-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }

          .admin-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

          .admin-topbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 18px 32px; background: #fff; border-bottom: 1px solid var(--border);
          }
          .admin-topbar h1 { margin: 0; font-size: 18px; font-weight: 700; color: var(--ink-text); }
          .admin-topbar-sub { margin: 2px 0 0; font-size: 12.5px; color: var(--muted); }

          .admin-profile-pill {
            display: flex; align-items: center; gap: 8px;
            padding: 6px 12px 6px 6px; border-radius: 999px;
            background: var(--paper); border: 1px solid var(--border);
          }
          .admin-profile-avatar {
            width: 26px; height: 26px; border-radius: 50%;
            background: linear-gradient(135deg, var(--coral), var(--coral-dark));
            color: #fff; font-size: 11px; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
          }
          .admin-profile-pill span { font-size: 12.5px; font-weight: 600; color: var(--ink-text); }

          .admin-content { flex: 1; padding: 28px 32px; overflow-y: auto; }

          @media (max-width: 900px) {
            .admin-sidebar { width: 76px; }
            .admin-brand-word, .admin-nav-link span, .admin-logout-btn span, .admin-nav-soon { display: none; }
            .admin-sidebar-brand { justify-content: center; padding-bottom: 20px; }
            .admin-nav-link, .admin-logout-btn { justify-content: center; }
          }
        `}</style>

        <AdminSidebar />

        <div className="admin-main">
          <header className="admin-topbar">
            <div>
              <h1>Admin Console</h1>
              <p className="admin-topbar-sub">Manage applications, approvals and bank operations</p>
            </div>
            <div className="admin-profile-pill">
              <div className="admin-profile-avatar">A</div>
              <span>Administrator</span>
            </div>
          </header>

          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminProvider>
  );
}