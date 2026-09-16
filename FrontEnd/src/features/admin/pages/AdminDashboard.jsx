import React from "react";
import { Link } from "react-router-dom";
import {
  Wallet, TrendingUp, PiggyBank, Users, Landmark, ShieldAlert, UserCheck, ArrowRight,
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import StatCard from "../components/StatCard";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: num >= 10_000_000 ? "compact" : "standard",
  }).format(num);

export default function AdminDashboard() {
  const { stats } = useAdmin();

  return (
    <div className="admin-dashboard">
      <style>{`
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .stat-card { display: flex; gap: 14px; background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
        .stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(255,107,74,0.1); color: #E24E2C; flex-shrink: 0; }
        .stat-icon.tone-ink { background: rgba(11,43,38,0.08); color: #0B2B26; }
        .stat-label { margin: 0 0 4px; font-size: 12.5px; color: var(--muted); font-weight: 500; }
        .stat-value { margin: 0; font-size: 20px; font-weight: 700; color: var(--ink-text); }
        .stat-trend { display: inline-block; margin-top: 6px; font-size: 11.5px; font-weight: 600; }
        .stat-trend.is-up { color: #1E7A3D; }
        .stat-trend.is-down { color: #B3261E; }

        .admin-panels { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; }
        .admin-panel { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 22px; }
        .admin-panel h2 { margin: 0 0 4px; font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; font-size: 1.2rem; color: var(--ink-text); }
        .admin-panel p.sub { margin: 0 0 18px; font-size: 12.5px; color: var(--muted); }

        .approval-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .approval-row:last-child { border-bottom: none; }
        .approval-row-label { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: var(--ink-text); font-weight: 500; }
        .approval-row-count { background: rgba(255,107,74,0.1); color: #E24E2C; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }

        .panel-link { display: inline-flex; align-items: center; gap: 5px; margin-top: 16px; font-size: 12.5px; font-weight: 600; color: #E24E2C; text-decoration: none; }

        .npa-figure { font-size: 32px; font-weight: 700; color: var(--ink-text); margin: 6px 0 2px; }
        .npa-caption { font-size: 12.5px; color: var(--muted); }

        @media (max-width: 900px) { .admin-panels { grid-template-columns: 1fr; } }
      `}</style>

      <div className="stat-grid">
        <StatCard icon={Wallet} label="Bank Budget / Treasury" value={formatINR(stats.bankBudget)} tone="ink" />
        <StatCard icon={TrendingUp} label="Total Interest Earned" value={formatINR(stats.totalInterestEarned)} trend={stats.monthlyGrowth} trendLabel="MoM" />
        <StatCard icon={PiggyBank} label="Net Profit (YTD)" value={formatINR(stats.totalProfit)} tone="ink" />
        <StatCard icon={Users} label="Total Customers" value={stats.totalCustomers.toLocaleString("en-IN")} trend={stats.monthlyGrowth} trendLabel="growth" />
        <StatCard icon={Landmark} label="Total Loan Book" value={formatINR(stats.totalLoanBook)} tone="ink" />
        <StatCard icon={ShieldAlert} label="NPA Ratio" value={`${stats.npaRatio}%`} />
      </div>

      <div className="admin-panels">
        <div className="admin-panel">
          <h2>Pending approvals</h2>
          <p className="sub">Items across the bank currently waiting on admin action.</p>

          <div className="approval-row">
            <span className="approval-row-label"><UserCheck size={16} /> Account onboarding</span>
            <span className="approval-row-count">{stats.pendingOnboarding}</span>
          </div>
          <div className="approval-row">
            <span className="approval-row-label"><Landmark size={16} /> Loan applications</span>
            <span className="approval-row-count">{stats.pendingLoanApplications}</span>
          </div>
          <div className="approval-row">
            <span className="approval-row-label"><ShieldAlert size={16} /> Insurance claims</span>
            <span className="approval-row-count">{stats.pendingInsuranceClaims}</span>
          </div>

          <Link to="/admin/onboarding" className="panel-link">
            Review onboarding queue <ArrowRight size={14} />
          </Link>
        </div>

        <div className="admin-panel">
          <h2>Portfolio health</h2>
          <p className="sub">Snapshot of asset quality</p>
          <p className="npa-figure">{stats.npaRatio}%</p>
          <p className="npa-caption">Non-performing assets ratio, within the &lt;3% target band.</p>
        </div>
      </div>
    </div>
  );
}