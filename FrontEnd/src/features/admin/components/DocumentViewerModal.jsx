import React, { useState } from "react";
import { X, FileText, ZoomIn } from "lucide-react";

const isPdf = (url) => !!url && url.toLowerCase().endsWith(".pdf");

export default function DocumentViewerModal({ applicant, documents, onClose }) {
  const [activeDoc, setActiveDoc] = useState(documents[0] || null);
  console.log(documents)

  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
        <style>{`
          .doc-modal-overlay {
            position: fixed; inset: 0; background: rgba(11,43,38,0.45);
            display: flex; align-items: center; justify-content: center;
            z-index: 100; padding: 24px; backdrop-filter: blur(2px);
            animation: overlayIn 180ms ease;
          }
          @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

          .doc-modal {
            background: #fff; border-radius: 18px; width: 100%; max-width: 780px;
            max-height: 88vh; display: flex; flex-direction: column; overflow: hidden;
            box-shadow: 0 30px 60px -12px rgba(11,43,38,0.35);
            animation: modalIn 220ms cubic-bezier(.16,1,.3,1);
          }
          @keyframes modalIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

          .doc-modal-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 18px 22px; border-bottom: 1px solid var(--border);
          }
          .doc-modal-header h3 {
            margin: 0; font-family: 'Instrument Serif', serif; font-style: italic;
            font-weight: 400; font-size: 1.15rem; color: var(--ink-text);
          }
          .doc-modal-header p { margin: 2px 0 0; font-size: 12px; color: var(--muted); }
          .doc-modal-close {
            border: none; background: var(--paper); width: 30px; height: 30px;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: var(--muted); transition: background 150ms ease, color 150ms ease;
          }
          .doc-modal-close:hover { background: rgba(226,78,44,0.1); color: var(--coral-dark); }

          .doc-modal-body { display: flex; flex: 1; min-height: 0; }
          .doc-modal-preview {
            flex: 1; background: #101514; display: flex; align-items: center;
            justify-content: center; padding: 18px; min-height: 320px;
          }
          .doc-modal-preview img { max-width: 100%; max-height: 55vh; border-radius: 8px; object-fit: contain; }
          .doc-modal-preview iframe {
            width: 100%; height: 55vh; border: none; border-radius: 8px; background: #fff;
          }
          .doc-modal-preview .doc-fallback {
            color: rgba(255,255,255,0.55); font-size: 13px; text-align: center;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
          }

          .doc-modal-list {
            width: 200px; flex-shrink: 0; border-left: 1px solid var(--border);
            padding: 14px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto;
          }
          .doc-thumb-btn {
            display: flex; align-items: center; gap: 8px; padding: 9px 10px;
            border-radius: 10px; border: 1px solid var(--border); background: var(--paper);
            font-size: 12.5px; font-weight: 500; color: var(--ink-text); cursor: pointer;
            text-align: left; transition: border-color 150ms ease, background 150ms ease;
          }
          .doc-thumb-btn.is-active { border-color: var(--coral); background: rgba(255,107,74,0.08); }
          .doc-thumb-btn svg { color: var(--coral-dark); flex-shrink: 0; }

          .doc-modal-footer {
            padding: 14px 22px; border-top: 1px solid var(--border);
            display: flex; justify-content: flex-end;
          }
          .doc-open-link {
            display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px;
            font-weight: 600; color: var(--coral-dark); text-decoration: none;
          }
        `}</style>

        <div className="doc-modal-header">
          <div>
            <h3>Submitted documents</h3>
            <p>{applicant}</p>
          </div>
          <button className="doc-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="doc-modal-body">
          <div className="doc-modal-preview">
            {!activeDoc?.url ? (
              <div className="doc-fallback">
                <FileText size={28} />
                <p>No file on record</p>
              </div>
            ) : isPdf(activeDoc.url) ? (
              <iframe src={activeDoc.url} title={activeDoc.label} />
            ) : (
              <img src={activeDoc.url} alt={activeDoc.label} />
            )}
          </div>

          <div className="doc-modal-list">
            {documents.map((doc) => (
              <button
                key={doc.label}
                className={`doc-thumb-btn${activeDoc?.label === doc.label ? " is-active" : ""}`}
                onClick={() => setActiveDoc(doc)}
              >
                <ZoomIn size={14} />
                {doc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="doc-modal-footer">
          {activeDoc?.url && (
            <a className="doc-open-link" href={activeDoc.url} target="_blank" rel="noreferrer">
              Open full size ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}