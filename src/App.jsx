import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Auth from "./pages/auth";
import AdminDashboard from "./pages/usersList";
import ProjectAccessManagement from "./pages/manageProfil";
import { isAuthenticated } from "./api/authService";

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" />;
  }
  
  return children;
};

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setAuthChecked(true);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/edituser/:id" 
          element={
            <ProtectedRoute>
              <ProjectAccessManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/admin" : "/auth"} />} />
      </Routes>
    </Router>
  );
}