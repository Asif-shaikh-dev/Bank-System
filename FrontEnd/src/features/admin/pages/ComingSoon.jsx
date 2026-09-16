import React from "react";
import { useLocation } from "react-router-dom";

export default function ComingSoon() {
  const { pathname } = useLocation();
  const section = pathname.split("/").filter(Boolean).pop();

  return (
    <div style={{
      background: "#fff", border: "1px solid #E4E0D6", borderRadius: 16,
      padding: "60px 24px", textAlign: "center", color: "#6E7C77",
    }}>
      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400,
        fontSize: "1.4rem", color: "#16231F", marginBottom: 8, textTransform: "capitalize",
      }}>
        {section} — coming soon
      </h2>
      <p style={{ fontSize: 13.5, margin: 0 }}>
        This module will follow the same pattern as onboarding review once its backend endpoints exist.
      </p>
    </div>
  );
}