import { useState } from "react";
import Modal from "../ui/Modal";
import { Link } from "react-router-dom";
const NAV_DATA = {
    accounts: [
      {
        id: "savings",
        label: "Savings Accounts",
        items: [
          "Senior Citizen Vishesh Samman SB",
          "Masterstroke LITE Saving Bank Account",
          "LITE Savings Account",
          "Family Savings Accounts Segment",
          "Champ Account",
          "Women Sapphire Savings Account",
          "Masterstroke Saving Bank Account",
          "BRO Saving Account",
          "Advantage Saving Account",
          "Super Savings Account",
        ],
        viewAllItems: "View All Saving Accounts",
        cta: {
          button: "Open a Savings Account Digitally",
          links: ["Application Form", "FAQs", "Contact Us"],
          viewAll: "View All Accounts",
        },
      },
      {
        id: "salary",
        label: "Salary Accounts",
        items: [
          "Premium Salary Account",
          "Classic Salary Account",
          "Defence Salary Account",
          "Government Salary Account",
        ],
        viewAllItems: "View All Salary Accounts",
        cta: {
          button: "Open a Salary Account",
          links: ["Eligibility", "Contact Us"],
          viewAll: "View All Accounts",
        },
      },
      {
        id: "current",
        label: "Current Account",
        items: [
          "Regular Current Account",
          "Premium Current Account",
          "Business Current Account",
          "Startup Current Account",
        ],
        viewAllItems: "View All Current Accounts",
        cta: {
          button: "Open a Current Account",
          links: ["Documents Required", "Contact Us"],
          viewAll: "View All Accounts",
        },
      },
      {
        id: "fixed-deposit",
        label: "Fixed Deposit",
        items: [
          "Regular Fixed Deposit",
          "Tax Saving Fixed Deposit",
          "Senior Citizen FD",
          "Recurring Deposit",
        ],
        viewAllItems: "View All Fixed Deposits",
        cta: {
          button: "Open a Fixed Deposit",
          links: ["Interest Rates", "FD Calculator"],
          viewAll: "View All Accounts",
        },
      },
      {
        id: "sdp",
        label: "bob SDP (Recurring Deposits)",
        items: ["Standard SDP", "Flexi SDP", "Junior SDP"],
        viewAllItems: "View All SDP Options",
        cta: {
          button: "Open a Recurring Deposit",
          links: ["Interest Rates", "Contact Us"],
          viewAll: "View All Accounts",
        },
      },
    ],
    loan: [
      {
        id: "home-loan",
        label: "Home Loan",
        items: [
          "Regular Home Loan",
          "Home Loan Top-Up",
          "Home Improvement Loan",
          "Plot Purchase Loan",
          "Balance Transfer",
          "NRI Home Loan",
        ],
        viewAllItems: "View All Home Loan Products",
        cta: {
          button: "Apply for Home Loan",
          links: ["EMI Calculator", "Documents Required", "Contact Us"],
          viewAll: "View All Loans",
        },
      },
      {
        id: "personal-loan",
        label: "Personal Loan",
        items: [
          "Regular Personal Loan",
          "Pre-Approved Personal Loan",
          "Personal Loan for Pensioners",
          "Personal Loan Top-Up",
        ],
        viewAllItems: "View All Personal Loan Products",
        cta: {
          button: "Apply for Personal Loan",
          links: ["EMI Calculator", "Check Eligibility"],
          viewAll: "View All Loans",
        },
      },
      {
        id: "car-loan",
        label: "Car Loan",
        items: ["New Car Loan", "Used Car Loan", "Car Loan Balance Transfer"],
        viewAllItems: "View All Car Loan Products",
        cta: {
          button: "Apply for Car Loan",
          links: ["EMI Calculator", "Contact Us"],
          viewAll: "View All Loans",
        },
      },
      {
        id: "education-loan",
        label: "Education Loan",
        items: ["Domestic Education Loan", "Study Abroad Loan", "Skill Loan"],
        viewAllItems: "View All Education Loan Products",
        cta: {
          button: "Apply for Education Loan",
          links: ["Eligibility", "Documents Required"],
          viewAll: "View All Loans",
        },
      },
    ],
 
    profile: [
      {
        id: "personal-info",
        label: "Personal Info",
        items: [
          "Name — Rohan Deshmukh",
          "Customer ID — CUS-4471029",
          "Mobile — +91 98xxxxxx21",
          "Email — rohan.d@example.com",
        ],
        viewAllItems: "View Full Profile",
        cta: {
          button: "Edit Profile",
          links: ["Update KYC", "Contact Us"],
          viewAll: "View Full Profile",
        },
      },
      {
        id: "security",
        label: "Security & Login",
        items: [
          "2-Factor Auth — Enabled",
          "Last Login — Today, 9:12 AM",
          "Registered Device — iPhone 15",
        ],
        viewAllItems: "View Security Settings",
        cta: {
          button: "Manage Security",
          links: ["Change Password", "Contact Us"],
          viewAll: "View Security Settings",
        },
      },
      {
        id: "preferences",
        label: "Preferences",
        items: ["SMS Alerts — On", "Email Statements — On", "Language — English"],
        viewAllItems: "View All Preferences",
        cta: {
          button: "Edit Preferences",
          links: ["Notification Settings", "Contact Us"],
          viewAll: "View All Preferences",
        },
      },
    ],
  };
  
  const NAV_ITEMS = [
    { key: "accounts", label: "Accounts" },
    { key: "loan", label: "Loan" },
    { key: "profile", label: "Profile" },
  ];
  
  export default function Navbar() {
    const [activeMenu, setActiveMenu] = useState(null);
    const [isSelected, setIsSelected] = useState(false);
  
    return (
      <header className="relative z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold  flex gap-1 items-center justify-center text-slate-900">
           <img className="h-10 w-10" src="./logo1.png" alt="" />
            Nexus Bank
          </span>
  
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.key} onMouseEnter={() => setActiveMenu(item.key)} className="relative">
                <button
                  type="button"
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeMenu === item.key
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </nav>
  
          <div className="flex-col items-center gap-3 realative">
            <div onClick={()=>setIsSelected(!isSelected)} className="cursor-pointer flex px-3 py-1 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
                Login 

            </div>
            {isSelected && (
            <div className="absolute top-full w-[7vw] bg-white shadow-lg z-50">
              <div className="cursor-pointer mx-auto max-w-6xl px-1.5 py-1 flex-col gap-3 items-center justify-center">
                <p className="rounded-sm hover:bg-gray-300 transition-all duration-300 ease-out px-1 py-1"><Link to="/login">Login</Link></p>
                <p className="hover:bg-gray-300 transition-all duration-300 ease-out px-1 py-1"><Link to="/register">Register</Link></p>
                
              </div>
            </div>
          )}
          </div>
          
        </div>
  
        <Modal
          isOpen={activeMenu !== null}
          sections={NAV_DATA[activeMenu] || []}
          onClose={() => setActiveMenu(null)}
        />
      </header>
    );
  }
  