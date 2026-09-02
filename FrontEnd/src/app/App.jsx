import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashBoard from '../features/dashboard/pages/Dashboard';
import LoginPage from "../features/auth/pages/Login"

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<DashBoard/>}></Route>
        <Route path="/login" element={<LoginPage/>}></Route>
      </Routes>
    </main>
  ); 
}

export default App;