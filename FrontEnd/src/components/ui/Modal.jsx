import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiggyBank,
  Wallet,
  Landmark,
  TrendingUp,
  Repeat,
  Home,
  IdCard,
  Car,
  GraduationCap,
  User,
  ShieldCheck,
  Settings,
  ChevronRight,
  FileText,
} from "lucide-react";

const CATEGORY_ICONS = {
  savings: PiggyBank,
  salary: Wallet,
  current: Landmark,
  "fixed-deposit": TrendingUp,
  sdp: Repeat,
  "home-loan": Home,
  "personal-loan": IdCard,
  "car-loan": Car,
  "education-loan": GraduationCap,
  "personal-info": User,
  security: ShieldCheck,
  preferences: Settings,
};

function getItemPath(menuKey, sectionId) {
  if (menuKey === "accounts") return "/open-account";
  if (menuKey === "loan") return `/loans/${sectionId}`;
  return "#";
}

function getCtaPath(menuKey, sectionId) {
  if (menuKey === "accounts") return "/open-account";
  if (menuKey === "loan") return `/loans/${sectionId}/apply`;
  if (menuKey === "profile") return `/profile/${sectionId}`;
  return "#";
}

export default function Modal({
  isOpen,
  menuKey,
  sections = [],
  onClose,
  onItemSelect,
  onCtaSelect,
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null);

  useEffect(() => {
    setActiveId(sections[0]?.id ?? null);
  }, [sections]);

  const current = sections.find((section) => section.id === activeId) ?? sections[0];
  const HeadingIcon = current ? CATEGORY_ICONS[current.id] ?? FileText : FileText;

  return (
    <div className={`meganav ${isOpen ? "is-open" : ""}`}>
      <div className="meganav-inner">
        <nav className="meganav-categories" aria-label="Categories">
          <ul>
            {sections.map((section) => {
              const SectionIcon = CATEGORY_ICONS[section.id] ?? FileText;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    className={`meganav-cat-btn ${activeId === section.id ? "is-active" : ""}`}
                    onMouseEnter={() => setActiveId(section.id)}
                    onFocus={() => setActiveId(section.id)}
                  >
                    <SectionIcon size={16} />
                    {section.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="meganav-items">
          {current && (
            <>
              <div className="meganav-items-heading">
                <HeadingIcon size={18} />
                <h3>{current.label}</h3>
              </div>

              <div className="meganav-items-grid">
                <ul>
                  {current.items.map((item, i) => (
                    <li key={item} style={{ "--i": i }}>
                      {current.interactive === false ? (
                        <span>{item}</span>
                      ) : (
                        <Link
                          to={getItemPath(menuKey, current.id)}
                          onClick={() => onItemSelect?.(current, item)}
                        >
                          {item}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {current.interactive !== false && (
                <Link
                  to={`/${menuKey}/${current.id}`}
                  className="meganav-viewall"
                  onClick={onClose}
                >
                  {current.viewAllItems}
                  <ChevronRight className="meganav-viewall-chevron" size={14} />
                </Link>
              )}
            </>
          )}
        </div>

        <div className="meganav-cta">
          {current?.cta && (
            <>
              <Link
                to={getCtaPath(menuKey, current.id)}
                className="meganav-cta-btn"
                onClick={() => onCtaSelect?.(current)}
              >
                {current.cta.button}
              </Link>

              <ul className="meganav-cta-links">
                {current.cta.links.map((link) => (
                  <li key={link}>
                    <Link to="#" onClick={onClose}>
                      <FileText size={14} />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link to={`/${menuKey}`} className="meganav-cta-viewall" onClick={onClose}>
                {current.cta.viewAll}
                <ChevronRight className="meganav-viewall-chevron" size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}