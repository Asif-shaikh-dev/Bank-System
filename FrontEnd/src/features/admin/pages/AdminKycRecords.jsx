import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAadhaarRecords, addAadhaarRecord, getPanRecords, addPanRecord } from "../admin.api";
import AdminTableStyles from "../components/AdminTableStyles";

const EMPTY_AADHAAR = { aadhaar_number: "", person_name: "", dob: "", gender: "", registered_phone: "" };
const EMPTY_PAN = { pan_number: "", name: "", father_name: "", date_of_birth: "" };
const fmtDate = (d) => (d ? String(d).slice(0, 10) : "");

export default function AdminKycRecords() {
  const [aadhaarList, setAadhaarList] = useState([]);
  const [panList, setPanList] = useState([]);
  const [aadhaar, setAadhaar] = useState(EMPTY_AADHAAR);
  const [pan, setPan] = useState(EMPTY_PAN);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      const [a, p] = await Promise.all([getAadhaarRecords(), getPanRecords()]);
      setAadhaarList(a.data.data || []);
      setPanList(p.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load the records.");
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (kind) => {
    setBusy(kind);
    try {
      if (kind === "aadhaar") {
        await addAadhaarRecord(aadhaar);
        setAadhaar(EMPTY_AADHAAR);
      } else {
        await addPanRecord(pan);
        setPan(EMPTY_PAN);
      }
      toast.success("Record added.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add the record.");
    } finally {
      setBusy(null);
    }
  };

  const aadhaarReady =
    aadhaar.aadhaar_number.length === 12 && aadhaar.person_name.trim() && aadhaar.dob;
  const panReady =
    /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.pan_number) && pan.name.trim() && pan.father_name.trim() && pan.date_of_birth;

  return (
    <div className="onboarding-page">
      <AdminTableStyles />
      <div className="onboarding-header">
        <div>
          <h2>Aadhaar &amp; PAN holders</h2>
          <p className="sub">Add the identity records that onboarding looks up.</p>
        </div>
      </div>

      <div className="kyc-grid">
        <div className="kyc-card">
          <h3>Add Aadhaar holder</h3>
          <div className="kyc-form">
            <input
              placeholder="12-digit Aadhaar number"
              inputMode="numeric"
              maxLength={12}
              value={aadhaar.aadhaar_number}
              onChange={(e) => setAadhaar((s) => ({ ...s, aadhaar_number: e.target.value.replace(/\D/g, "") }))}
            />
            <input
              placeholder="Full name"
              value={aadhaar.person_name}
              onChange={(e) => setAadhaar((s) => ({ ...s, person_name: e.target.value }))}
            />
            <input
              type="date"
              title="Date of birth"
              value={aadhaar.dob}
              onChange={(e) => setAadhaar((s) => ({ ...s, dob: e.target.value }))}
            />
            <select
              value={aadhaar.gender}
              onChange={(e) => setAadhaar((s) => ({ ...s, gender: e.target.value }))}
              style={{ padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }}
            >
              <option value="">Gender (optional)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              placeholder="Registered phone (optional)"
              inputMode="numeric"
              maxLength={10}
              value={aadhaar.registered_phone}
              onChange={(e) => setAadhaar((s) => ({ ...s, registered_phone: e.target.value.replace(/\D/g, "") }))}
            />
            <button className="primary-btn" disabled={busy === "aadhaar" || !aadhaarReady} onClick={() => submit("aadhaar")}>
              {busy === "aadhaar" ? "Adding…" : "Add Aadhaar holder"}
            </button>
          </div>
          <div className="mini-list">
            {aadhaarList.map((r) => (
              <div className="mini-row" key={r.aadhaar_number}>
                <span>{r.aadhaar_number}</span>
                <span>{r.person_name} · {fmtDate(r.dob)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="kyc-card">
          <h3>Add PAN holder</h3>
          <div className="kyc-form">
            <input
              placeholder="PAN (ABCDE1234F)"
              maxLength={10}
              value={pan.pan_number}
              onChange={(e) => setPan((s) => ({ ...s, pan_number: e.target.value.toUpperCase() }))}
            />
            <input
              placeholder="Full name"
              value={pan.name}
              onChange={(e) => setPan((s) => ({ ...s, name: e.target.value }))}
            />
            <input
              placeholder="Father's name"
              value={pan.father_name}
              onChange={(e) => setPan((s) => ({ ...s, father_name: e.target.value }))}
            />
            <input
              type="date"
              title="Date of birth"
              value={pan.date_of_birth}
              onChange={(e) => setPan((s) => ({ ...s, date_of_birth: e.target.value }))}
            />
            <button className="primary-btn" disabled={busy === "pan" || !panReady} onClick={() => submit("pan")}>
              {busy === "pan" ? "Adding…" : "Add PAN holder"}
            </button>
          </div>
          <div className="mini-list">
            {panList.map((r) => (
              <div className="mini-row" key={r.id}>
                <span>{r.pan_number}</span>
                <span>{r.name} · {fmtDate(r.date_of_birth)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}