import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashBoard from '../features/dashboard/pages/Dashboard';
import LoginPage from "../features/auth/pages/Login"
import OpenAccount from '../features/accounts/pages/OpenAccount';
import AdminLogin from '../features/auth/pages/AdminLogin';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '../store/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import AdminOnboardingApplications from '../features/admin/pages/AdminOnboardingApplications';
import ComingSoon from '../features/admin/pages/ComingSoon';
import Accounts from '../features/accounts/pages/Accounts';
import AccountDetails from '../features/accounts/pages/AccountDetails';
import Profile from '../features/profile/pages/Profile';

// New pages the dashboard's quick actions link to.
// Adjust these import paths if any of yours differ.
// import TransferMoney from '../features/transactions/pages/TransferMoney';
// import Transactions from '../features/transactions/pages/Transactions';
// import Loans from '../features/loans/pages/Loans';
// import ApplyLoan from '../features/loans/pages/ApplyLoan';
// import Insurance from '../features/insurance/pages/Insurance';
// import ApplyInsurance from '../features/insurance/pages/ApplyInsurance';
// import Profile from '../features/profile/pages/Profile';
// import Accounts from '../features/accounts/pages/Accounts';
// import AccountDetails from '../features/accounts/pages/AccountDetails';

function App() {
  return (
    <main>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={5000} />
        <Routes>
          <Route path="/login" element={<LoginPage/>}></Route>
          <Route path="/admin-login" element={<AdminLogin/>}></Route>

          <Route element={<ProtectedRoute/>}>
            <Route path="/" element={<DashBoard/>}></Route>
            <Route path="/open-account" element={<OpenAccount/>}></Route>
            <Route path="/profile" element={<Profile/>}></Route>
            <Route path="/profile/:section" element={<Profile/>}></Route>
            <Route path="/accounts" element={<Accounts/>}></Route>
            <Route path="/accounts/:id" element={<AccountDetails/>}></Route>
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="onboarding" element={<AdminOnboardingApplications />} />
            <Route path="loans" element={<ComingSoon />} />
            <Route path="insurance" element={<ComingSoon />} />
            <Route path="transactions" element={<ComingSoon />} />
          </Route>
        </Routes>
      </AuthProvider>
    </main>
  ); 
}

export default App;