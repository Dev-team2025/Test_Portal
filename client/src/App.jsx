import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthTabs from './components/authTabs/AuthTabs';
import Quiz from './components/quiz/Quiz';
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './components/LandingPage/LandingPage';
import Features from './components/LandingPage/Features';
import Footer from './components/footer/Footer';
import Charts from './components/charts/Charts';
import Result from './components/charts/Result';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Analyse from './components/dashboard/Analyse';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthTabs activeTab="login" />} />
        <Route path="/signup" element={<AuthTabs activeTab="signup" />} />

        {/* 🔒 Private Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/features"
          element={
            <ProtectedRoute>
              <Features />
            </ProtectedRoute>
          }
        />
        <Route
          path="/charts"
          element={
            <ProtectedRoute>
              <Charts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/result"
          element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyse/:userId"
          element={
            <ProtectedRoute>
              <Analyse />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;