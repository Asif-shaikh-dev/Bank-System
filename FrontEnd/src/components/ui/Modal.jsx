import { useEffect, useState } from "react";

// ------------------------------------------------------------------
// This file exists ONLY so you can preview the header live in chat.
// In your real project, keep Modal.jsx and Navbar.jsx as separate
// files (already provided) — this is just those two merged into one
// file plus the demo data, so it can render without external imports.
// ------------------------------------------------------------------

export default function Modal({ isOpen, sections = [], onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) setActiveIndex(0);
  }, [isOpen]);

  if (!sections.length) return null;

  const active = sections[activeIndex];
  const items = active.items || [];
  const midpoint = Math.ceil(items.length / 2);
  const columnOne = items.slice(0, midpoint);
  const columnTwo = items.slice(midpoint);

  return (
    <div
      onMouseLeave={onClose}
      className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 w-full border-t border-slate-200 bg-white shadow-2xl shadow-slate-900/10 z-40 overflow-hidden transition-all duration-300 ease-out ${
        isOpen
          ? "max-h-[280px] opacity-100 translate-y-0"
          : "max-h-0 opacity-0 -translate-y-3 pointer-events-none"
      }`}
    >
      <div className="mx-auto max-w-6xl grid grid-cols-[220px_1fr_260px] gap-8 px-6 py-6">
        {/* Left: category list */}
        <div className="border-r border-slate-100 pr-6">
          <ul className="space-y-3">
            {sections.map((section, idx) => (
              <li key={section.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onFocus={() => setActiveIndex(idx)}
                  className={`text-left text-sm transition-colors ${
                    idx === activeIndex
                      ? "font-semibold text-teal-700"
                      : "text-slate-600 hover:text-teal-700"
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Middle: plain-text item list, two columns */}
        <div className="grid grid-cols-2 gap-x-8">
          <ul>
            {columnOne.map((item, i) => (
              <li
                key={i}
                className="border-b border-slate-100 py-3 text-sm text-slate-700 first:pt-0"
              >
                <button type="button" className="text-left transition-colors hover:text-teal-700">
                  {item}
                </button>
              </li>
            ))}
          </ul>
          <ul>
            {columnTwo.map((item, i) => (
              <li
                key={i}
                className="border-b border-slate-100 py-3 text-sm text-slate-700 first:pt-0"
              >
                <button type="button" className="text-left transition-colors hover:text-teal-700">
                  {item}
                </button>
              </li>
            ))}
          </ul>

          {active.viewAllItems && (
            <div className="col-span-2 pt-2 text-right">
              <button
                type="button"
                className="text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
              >
                {active.viewAllItems} &nbsp;→
              </button>
            </div>
          )}
        </div>

        {/* Right: call-to-action panel */}
        {active.cta && (
          <div className="border-l border-slate-100 pl-6">
            {active.cta.button && (
              <button
                type="button"
                className="w-full rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                {active.cta.button}
              </button>
            )}

            {active.cta.links?.length > 0 && (
              <p className="mt-4 text-sm text-slate-600">
                {active.cta.links.map((link, i) => (
                  <span key={i}>
                    <button type="button" className="transition-colors hover:text-teal-700">
                      {link}
                    </button>
                    {i < active.cta.links.length - 1 && (
                      <span className="mx-2 text-slate-300">|</span>
                    )}
                  </span>
                ))}
              </p>
            )}

            {active.cta.viewAll && (
              <button
                type="button"
                className="mt-4 block text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
              >
                {active.cta.viewAll} &nbsp;→
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}