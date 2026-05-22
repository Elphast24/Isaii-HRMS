import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  // HiOutlineHome,
  HiOutlineUsers,
  // HiOutlineClipboardDocumentList,
  // HiOutlineCalendarDays,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingOffice2,
  HiOutlineChartBarSquare,
  // HiOutlineCog6Tooth,
} from "react-icons/hi2";
import {
  // MdOutlineSpaceDashboard,
  MdOutlinePendingActions,
} from "react-icons/md";
import { BsPersonCheck, BsShieldCheck } from "react-icons/bs";
import { RiLeafLine, RiTimeLine } from "react-icons/ri";
import { TbLayoutDashboard } from "react-icons/tb";

import "./Sidebar.css";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // ── Nav Link Definitions ───────────────────────────────────────────────────
  const adminLinks = [
    {
      to:    "/admin-dashboard",
      label: "Dashboard",
      icon:  TbLayoutDashboard,
      desc:  "Overview & stats",
    },
    {
      to:    "/employee-management",
      label: "Employees",
      icon:  HiOutlineUsers,
      desc:  "Manage your team",
    },
    {
      to:    "/attendance-management",
      label: "Attendance",
      icon:  BsPersonCheck,
      desc:  "Track check-ins",
    },
    {
      to:    "/leave-management",
      label: "Leave Requests",
      icon:  MdOutlinePendingActions,
      desc:  "Approve & reject",
    },
  ];

  const employeeLinks = [
    {
      to:    "/employee-dashboard",
      label: "Dashboard",
      icon:  TbLayoutDashboard,
      desc:  "Your overview",
    },
    {
      to:    "/my-attendance",
      label: "Attendance",
      icon:  BsPersonCheck,
      desc:  "Check in / out",
    },
    {
      to:    "/my-leaves",
      label: "My Leaves",
      icon:  RiLeafLine,
      desc:  "Apply & track",
    },
  ];

  const links = user?.role === "admin" ? adminLinks : employeeLinks;

  // ── Avatar gradient by role ────────────────────────────────────────────────
  const avatarGradient =
    user?.role === "admin"
      ? "linear-gradient(135deg, #f16363, #8b5cf6)"
      : "linear-gradient(135deg, #10b981, #059669)";

  return (
    <aside className="sb-sidebar">

      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div className="sb-brand">
        <div className="sb-brand-icon">
          <HiOutlineBuildingOffice2 size={22} color="#fff" />
        </div>
        <div className="sb-brand-text">
          <span className="sb-brand-name">HRMS</span>
          <span className="sb-brand-sub">Management Portal</span>
        </div>
      </div>

      {/* ── User Card ─────────────────────────────────────────────────────── */}
      <div className="sb-user-card">
        <div className="sb-user-avatar" style={{ background: avatarGradient }}>
          {user?.name?.charAt(0).toUpperCase()}
          <div className="sb-online-dot" />
        </div>
        <div className="sb-user-info">
          <p className="sb-user-name">{user?.name}</p>
          <div className={`sb-role-badge ${user?.role}`}>
            {user?.role === "admin" ? (
              <><BsShieldCheck size={10} /> Admin</>
            ) : (
              <><BsPersonCheck size={10} /> Employee</>
            )}
          </div>
        </div>
      </div>

      {/* ── Navigation Label ──────────────────────────────────────────────── */}
      <div className="sb-nav-label">Navigation</div>

      {/* ── Navigation Links ──────────────────────────────────────────────── */}
      <nav className="sb-nav">
        {links.map(({ to, label, icon: Icon, desc }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sb-nav-link ${isActive ? "active" : ""}`
            }
          >
            <div className="sb-link-icon-wrap">
              <Icon size={20} />
            </div>
            <div className="sb-link-text">
              <span className="sb-link-label">{label}</span>
              <span className="sb-link-desc">{desc}</span>
            </div>
            <div className="sb-link-indicator" />
          </NavLink>
        ))}
      </nav>

      {/* ── Spacer ────────────────────────────────────────────────────────── */}
      <div className="sb-spacer" />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="sb-footer">
        <div className="sb-version-tag">
          <HiOutlineChartBarSquare size={14} />
          <span>HRMS v1.0</span>
        </div>
        <button className="sb-logout-btn" onClick={handleLogout}>
          <div className="sb-logout-icon-wrap">
            <HiOutlineArrowRightOnRectangle size={18} />
          </div>
          <span className="sb-logout-label">Logout</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;