import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const adminLinks = [
    { path: "/admin-dashboard", label: "Dashboard", icon: "📊" },
    { path: "/employee-management", label: "Employees", icon: "👥" },
    { path: "/attendance-management", label: "Attendance", icon: "📅" },
    { path: "/leave-management", label: "Leaves", icon: "📋" },
  ];

  const employeeLinks = [
    { path: "/employee-dashboard", label: "Dashboard", icon: "📊" },
    { path: "/my-attendance", label: "My Attendance", icon: "📅" },
    { path: "/my-leaves", label: "My Leaves", icon: "📋" },
  ];

  const links = user?.role === "admin" ? adminLinks : employeeLinks;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">👥</span>
        <span className="brand-name">HRMS</span>
      </div>

      {/* Desktop Links */}
      <div className="navbar-links">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>

      {/* User Info & Logout */}
      <div className="navbar-user">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${
                location.pathname === link.path ? "active" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="mobile-logout-btn">
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;