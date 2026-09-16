import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CharityDirectory from './pages/CharityDirectory';
import CharityProfile from './pages/CharityProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDraws from './pages/AdminDraws';
import AdminCharities from './pages/AdminCharities';
import AdminWinners from './pages/AdminWinners';
import AdminReports from './pages/AdminReports';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/charities" element={<CharityDirectory />} />
          <Route path="/charities/:id" element={<CharityProfile />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/draws"
            element={
              <AdminRoute>
                <AdminDraws />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/charities"
            element={
              <AdminRoute>
                <AdminCharities />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/winners"
            element={
              <AdminRoute>
                <AdminWinners />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminReports />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
