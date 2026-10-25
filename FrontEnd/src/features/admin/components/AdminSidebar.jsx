import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, UserCheck, Landmark, ShieldCheck, ArrowLeftRight, Users, IdCard, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/onboarding", label: "Onboarding Applications", icon: UserCheck },
  { to: "/admin/loans", label: "Loan Approvals", icon: Landmark },
  { to: "/admin/account-holders", label: "Account Holders", icon: Users },
  { to: "/admin/kyc", label: "KYC Records", icon: IdCard },
  { to: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
  // { to: "/admin/insurance", label: "Insurance Claims", icon: ShieldCheck, soon: true },
];
export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // No admin JWT/session exists yet — this just clears the client-side
    // flag. Wire this up properly once AdminLogin issues a real token.
    sessionStorage.removeItem("isAdminAuthenticated");
    navigate("/admin-login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-brand-mark" />
        <span className="admin-brand-word">
          Admin <span className="accent">Console</span>
        </span>
      </div>

      <nav className="admin-sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, soon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `admin-nav-link${isActive ? " is-active" : ""}`}
          >
            <Icon size={17} />
            <span>{label}</span>
            {soon && <span className="admin-nav-soon">Soon</span>}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="admin-logout-btn" onClick={handleLogout}>
        <LogOut size={17} />
        <span>Log out</span>
      </button>
    </aside>
  );
}