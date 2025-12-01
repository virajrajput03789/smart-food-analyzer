import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
  useLocation,
} from 'react-router-dom';

import Header from "./pages/Header.jsx";
import Footer from "./pages/Footer.jsx";
import Home from './pages/Home.jsx';
import AboutUs from './pages/AboutUs.jsx';
import ContactUs from './pages/ContactUs.jsx';
import Scan from './components/FoodScan.jsx';
import Login from './components/LoginComponent.jsx';
import SignIn from './components/SignIn.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Dashboard from './components/DashBoard.jsx';
import ScanHistory from './components/ScanHistory.jsx';
import ScrollToTopButton from './components/ScrollToTopButton.jsx';
import { Toaster } from 'react-hot-toast';
import Profile from './components/Profile.jsx';
import ScanTypeSelector from './components/ScanTypeSelector.jsx';
import BackButton from './pages/BackButton.jsx';
import CosmeticScan from './components/CosmeticScan.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';

function AppContent() {
  const location = useLocation();

  const showBackButtonOn = [
    '/aboutUs',
    '/contactUs',
    '/select-scan',
    '/scan',
    '/scan-cosmetics',
    '/dashboard',
    '/history',
    '/profile',
    '/login',
    '/signin',
    '/privacy'
  ];

  const shouldShowBackButton = showBackButtonOn.includes(location.pathname);

  return (
    <div className="relative flex flex-col min-h-screen bg-white overflow-x-hidden">
      <Header />
      {shouldShowBackButton && <BackButton />}

      <main className="flex-grow pt-28 sm:pt-24 md:pt-32 lg:pt-36">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/contactUs" element={<ContactUs />} />
          <Route
            path="/select-scan"
            element={
              <PrivateRoute>
                <ScanTypeSelector />
              </PrivateRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <PrivateRoute>
                <Scan scanType="food" />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <ScanHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/scan-cosmetics"
            element={
              <PrivateRoute>
                <CosmeticScan scanType="cosmetic" />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
           <Route path="/privacy" element={<PrivacyPolicy />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />
      <ScrollToTopButton />
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}