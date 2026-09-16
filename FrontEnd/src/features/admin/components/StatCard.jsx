import React from "react";

export default function StatCard({ icon: Icon, label, value, trend, trendLabel, tone = "default" }) {
  const isPositive = trend != null && trend >= 0;

  return (
    <div className="stat-card">
      <div className={`stat-icon tone-${tone}`}>
        {Icon && <Icon size={18} />}
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
        {trend != null && (
          <span className={`stat-trend ${isPositive ? "is-up" : "is-down"}`}>
            {isPositive ? "▲" : "▼"} {Math.abs(trend)}% {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}