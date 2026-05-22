import "./App.css";
import Login from "./component/authenticate";
import Register from "./component/register/register";
import AdminDash from "./pages/admin/dashboard/adminDash";
import EmployeeList from "./pages/admin/empManagement/empManage";
import AttendanceManagement from "./pages/admin/attendance/attManage";
import LeaveManagement from "./pages/admin/leaves/leaveManage";
import EmployeeDashboard from "./pages/user/dashboard/empDashboard";
import EmployeeAttendance from "./pages/user/attendance/empAttendance";
import EmployeeLeaves from "./pages/user/leaves/ApplyLeave";
import ProtectedRoute from "./component/protectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EmployeeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AttendanceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <LeaveManagement />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-attendance"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-leaves"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeLeaves />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;