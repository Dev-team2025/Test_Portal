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
import EditUserDetails from './components/AdminAccessDetails/EditUserDetails';
import Analyse from './components/dashboard/Analyse';
import AdminDashboard from './components/dashboard/AdminDashboard';
import UsersManagement from './components/AdminAccessDetails/UsersManagement';
import QuestionsManagement from './components/AdminAccessDetails/QuestionsManagement';
import GenerateReport from './components/AdminAccessDetails/GenerateReport';
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthTabs activeTab="login" />} />
        <Route path="/signup" element={<AuthTabs activeTab="signup" />} />
        <Route path="/admin/settings" element={<QuestionsManagement />} />
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
          path="/admindashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <GenerateReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/edit/:id"
          element={
            <ProtectedRoute>
              <EditUserDetails />
            </ProtectedRoute>
          } />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UsersManagement />
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

    </Router>
  );
}

export default App;