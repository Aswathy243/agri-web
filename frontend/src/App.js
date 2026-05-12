// App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Navbar from './components/navbar';
import LanguageSwitcher from './components/LanguageSwitcher';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import Home from './pages/Home';
import Advisory from './pages/Advisory';
import WelcomePage from './pages/WelcomePage';
import CropLoss from './pages/CropLoss';
import WeatherPage from './pages/WeatherPage';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';
import AdminAlerts from './pages/admin/AdminAlerts';
import { LanguageProvider } from './context/LanguageContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage'; // or wherever your login page is
import FarmerForum from './pages/FarmerForum';
import LoginExpert from './pages/LoginExpert';
import SendOTP from './pages/SendOTP';
import ResetPassword from './pages/ResetPassword';
import Forgot from './pages/ForgotPasswordPage';
import Expert_Forum from './pages/Expert_Forum';
import Trd from './components/TrackReportDetails';

// ✅ Wrapper for `useLocation`
function AppWrapper() {
  return (
    <LanguageProvider>
      <Router>
        <App />
      </Router>
    </LanguageProvider>
  );
}

function App() {
  const location = useLocation();
  const userId = localStorage.getItem('userId') || 'default-user-id';
  //const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const isAdmin = true;

  // Pages where UI like navbar/footer/chatbot should be hidden
  const adminRoutes = [
    '/admin_dashboard',
    '/admin/reports',
    '/admin/alerts',
    '/official-login',
    '/Expert_Forum',
  ];
  const hideUI = adminRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Show Navbar on non-admin routes */}
      {!hideUI && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home userId={userId} />} />
          <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              {/* <Route path="/forum" element={<FarmerForum />} /> */}
              <Route path="/WelcomePage" element={<WelcomePage />} />
             <Route path="/forgotpassword" element={<Forgot userId={userId} />} />
             <Route path="/farmerforum" element={<FarmerForum />} />
             <Route path="/LoginExpert" element={<LoginExpert/>} /> 
             <Route path="/ResetPassword" element={<ResetPassword/>} />
             <Route path="/SendOTP" element={<SendOTP/>} />
             
            <Route path="/home" element={<Home userId={userId} />} />
          <Route path="/advisory" element={<Advisory userId={userId} />} />
          <Route path="/crop-loss" element={<CropLoss userId={userId} />} />
        { /* <Route path="/forum" element={<Forum userId={userId} />} />*/}
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/dashboard" element={<Dashboard userId={userId} />} />
          
          {/* Admin Routes */}
          <Route path="/official-login" element={<AdminLogin />} />
          {isAdmin && (
            <>
              <Route path="/admin_dashboard" element={<AdminDashboard />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/alerts" element={<AdminAlerts />} />
              <Route path="/Expert_Forum" element={<Expert_Forum />} />
            </>
          )}
        </Routes>
      </main>

      {/* Show Footer & Chatbot only on non-admin routes */}
      {!hideUI && <Footer />}
      {!hideUI && <ChatbotWidget />}
      {!hideUI && <LanguageSwitcher />} 
{/* Optional: only if using the widget */}
    </div>
  );
}

export default AppWrapper;
