export default function AdminTableStyles() {
    return (
      <style>{`
        .onboarding-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
        .onboarding-header h2 { margin: 0 0 4px; font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; font-size: 1.3rem; color: var(--ink-text); }
        .onboarding-header .sub { margin: 0; font-size: 12.5px; color: var(--muted); }
        .count-pill { background: rgba(255,107,74,0.1); color: #E24E2C; font-size: 12.5px; font-weight: 700; padding: 5px 14px; border-radius: 999px; }
        .pill-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .onboarding-empty { display: flex; align-items: center; gap: 10px; padding: 48px 0; justify-content: center; color: var(--muted); font-size: 14px; background: #fff; border: 1px solid var(--border); border-radius: 16px; }
        .spin { animation: spin 900ms linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .onboarding-table-wrap { background: #fff; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
        .onboarding-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .onboarding-table th { text-align: left; padding: 12px 16px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--muted); background: var(--paper); border-bottom: 1px solid var(--border); }
        .onboarding-table td { padding: 13px 16px; border-bottom: 1px solid var(--border); vertical-align: top; color: var(--ink-text); }
        .onboarding-table tr:last-child td { border-bottom: none; }
        .applicant-name { font-weight: 600; }
        .applicant-sub { font-size: 11.5px; color: var(--muted); margin-top: 2px; }
        .amount-credit { color: #1E7A3D; font-weight: 700; }
        .amount-debit { color: #B3261E; font-weight: 700; }
        .type-badge { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .type-badge.credit { background: rgba(30,122,61,0.1); color: #1E7A3D; }
        .type-badge.debit { background: rgba(179,38,30,0.1); color: #B3261E; }
        .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
        .toolbar input { flex: 1; min-width: 220px; padding: 9px 12px; border: 1px solid var(--border); border-radius: 10px; font: inherit; font-size: 13px; background: #fff; color: var(--ink-text); }
        .filter-btn { border: 1px solid var(--border); background: #fff; border-radius: 999px; padding: 7px 14px; font-size: 12.5px; font-weight: 600; color: var(--muted); cursor: pointer; }
        .filter-btn.is-active { background: rgba(255,107,74,0.12); border-color: var(--coral); color: var(--coral-dark); }
        .kyc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .kyc-card { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
        .kyc-card h3 { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: var(--ink-text); }
        .kyc-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
        .kyc-form input { padding: 9px 12px; border: 1px solid var(--border); border-radius: 10px; font: inherit; font-size: 13px; color: var(--ink-text); }
        .primary-btn { border: none; border-radius: 10px; padding: 10px 14px; background: linear-gradient(135deg, var(--coral), var(--coral-dark)); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
        .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .mini-list { max-height: 260px; overflow-y: auto; border-top: 1px solid var(--border); }
        .mini-row { display: flex; justify-content: space-between; padding: 9px 2px; border-bottom: 1px solid var(--border); font-size: 12.5px; color: var(--ink-text); }
        @media (max-width: 900px) {
          .onboarding-table-wrap { overflow-x: auto; }
          .onboarding-table { min-width: 820px; }
          .kyc-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    );
  }