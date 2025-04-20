import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Auth from "./pages/auth";
import AdminDashboard from "./pages/usersList";
import ProjectAccessManagement from "./pages/manageProfil";
import ProjectList from "./pages/projectList";
import ProjectDetails from "./pages/projectDetails";
import { isAuthenticated, isAdmin } from "./api/authService";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" />;
  }
  
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/projects" />;
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
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/edituser/:id" 
          element={
            <ProtectedRoute adminOnly={true}>
              <ProjectAccessManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/project/:id" 
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to={isAuthenticated() ? (isAdmin() ? "/admin" : "/projects") : "/auth"} />} />
      </Routes>
    </Router>
  );
}