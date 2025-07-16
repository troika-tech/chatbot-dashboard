import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";
import CompaniesPage from "./pages/CompaniesPage";
import ChatbotPage from "./pages/ChatbotPage";
import AddAdminPage from "./pages/AddAdminPage";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import MessageHistoryPage from "./pages/MessageHistoryPage";
import "./App.css";

function App() {
  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Admin routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="chatbots" element={<ChatbotPage />} />
          <Route path="add-admin" element={<AddAdminPage />} />
        </Route>

        {/* User route */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/message-history"
          element={
            <ProtectedRoute role="user">
              <MessageHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
