import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Auth from "./pages/auth";
//import AdminnDashboard from "./pages/dash";
import AdminDashboard from "./pages/usersList";
import ProjectAccessManagement from "./pages/manageProfil";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/edituser" element={<ProjectAccessManagement />} />
      </Routes>
    </Router>
  );
}
