import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../component/sidebar/sidebar";
import {
  getEmployeeStatsAPI,
  getTodaySummaryAPI,
  getAllLeavesAPI,
} from "../../../service/api";
import { useAuth } from "../../../context/AuthContext";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineRefresh,
} from "react-icons/hi";
import {
  MdOutlinePendingActions,
  MdOutlineApproval,
  MdOutlineCancel,
} from "react-icons/md";
import {
  BsArrowUpRight,
  BsPersonCheck,
  BsClockHistory,
} from "react-icons/bs";
import { FiArrowRight } from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";

import "./adminDash.css";

// ── Stat Card Component ───────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, gradient, subtitle, trend }) => (
  <div className="stat-card-new">
    <div className="stat-card-inner">
      <div className="stat-top-row">
        <div className="stat-icon-wrap" style={{ background: gradient }}>
          <Icon size={22} color="#fff" />
        </div>
        {trend !== undefined && (
          <div className={`stat-trend ${trend >= 0 ? "up" : "down"}`}>
            <BsArrowUpRight size={12} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="stat-body">
        <h3 className="stat-num">{value}</h3>
        <p className="stat-label">{title}</p>
        {subtitle && <span className="stat-sub">{subtitle}</span>}
      </div>
    </div>
    <div className="stat-card-glow" style={{ background: gradient }} />
  </div>
);

// ── Badge helper ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    pending:  { cls: "badge-pending",  Icon: MdOutlinePendingActions, label: "Pending"  },
    approved: { cls: "badge-approved", Icon: MdOutlineApproval,       label: "Approved" },
    rejected: { cls: "badge-rejected", Icon: MdOutlineCancel,         label: "Rejected" },
  };
  const { cls, Icon, label } = config[status] ?? config.pending;
  return (
    <span className={`status-badge ${cls}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminDash = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalEmployees: 0, activeEmployees: 0,
    totalDepartments: 0, presentToday: 0,
    pendingLeaves: 0, approvedLeaves: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(new Date());

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [empRes, attRes, pendingRes, allRes] = await Promise.all([
        getEmployeeStatsAPI(),
        getTodaySummaryAPI(),
        getAllLeavesAPI({ status: "pending" }),
        getAllLeavesAPI(),
      ]);

      setStats({
        totalEmployees:   empRes.data.stats.totalEmployees,
        activeEmployees:  empRes.data.stats.activeEmployees,
        totalDepartments: empRes.data.stats.totalDepartments,
        presentToday:     attRes.data.totalPresent,
        pendingLeaves:    pendingRes.data.summary.pending,
        approvedLeaves:   allRes.data.summary.approved,
      });

      setRecentLeaves(allRes.data.leaves.slice(0, 6));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Greeting based on time ─────────────────────────────────────────────────
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // ── Leave type config ──────────────────────────────────────────────────────
  const leaveTypeStyle = (type) => ({
    sick:      { bg: "#fef2f2", color: "#ef4444", label: "Sick"      },
    casual:    { bg: "#eff6ff", color: "#3b82f6", label: "Casual"    },
    annual:    { bg: "#f0fdf4", color: "#10b981", label: "Annual"    },
    maternity: { bg: "#fff7ed", color: "#f97316", label: "Maternity" },
    unpaid:    { bg: "#f8fafc", color: "#64748b", label: "Unpaid"    },
  }[type] ?? { bg: "#f8fafc", color: "#64748b", label: type });

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="ad-layout">
        <Sidebar />
        <main className="ad-main">
          <div className="ad-loader">
            <div className="ad-loader-ring" />
            <p>Loading dashboard…</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Stat cards data ────────────────────────────────────────────────────────
  const statCards = [
    {
      title:    "Total Employees",
      value:    stats.totalEmployees,
      icon:     HiOutlineUsers,
      gradient: "linear-gradient(135deg,#f16363,#8b5cf6)",
      subtitle: `${stats.activeEmployees} currently active`,
      trend:    5,
    },
    {
      title:    "Present Today",
      value:    stats.presentToday,
      icon:     BsPersonCheck,
      gradient: "linear-gradient(135deg,#10b981,#059669)",
      subtitle: "Checked in employees",
      trend:    2,
    },
    {
      title:    "Pending Leaves",
      value:    stats.pendingLeaves,
      icon:     MdOutlinePendingActions,
      gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
      subtitle: "Awaiting your approval",
      trend:    -3,
    },
    {
      title:    "Departments",
      value:    stats.totalDepartments,
      icon:     HiOutlineOfficeBuilding,
      gradient: "linear-gradient(135deg,#ec4899,#db2777)",
      subtitle: "Active departments",
    },
  ];

  return (
    <div className="ad-layout">
      <Sidebar />
      <main className="ad-main">

        {/* ── Top Bar ─────────────────────────────────────────────────────── */}
        <div className="ad-topbar">
          <div className="ad-greeting">
            <div className="ad-greeting-badge">
              <HiOutlineChartBar size={16} />
              <span>Admin Dashboard</span>
            </div>
            <h1>{getGreeting()}, <span className="ad-name">{user?.name}</span></h1>
            <p className="ad-date">
              <HiOutlineCalendar size={14} />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long", year: "numeric",
                month: "long", day: "numeric",
              })}
            </p>
          </div>

          <div className="ad-topbar-actions">
            <div className="ad-last-updated">
              <BsClockHistory size={13} />
              <span>
                Updated {lastUpdated.toLocaleTimeString("en-US", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
            <button
              className={`ad-refresh-btn ${refreshing ? "spinning" : ""}`}
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              title="Refresh dashboard"
            >
              <HiOutlineRefresh size={17} />
            </button>
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="ad-stats-grid">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* ── Content Row ─────────────────────────────────────────────────── */}
        <div className="ad-content-grid">

          {/* ── Recent Leave Requests ──────────────────────────────────────── */}
          <div className="ad-card ad-card-wide">
            <div className="ad-card-header">
              <div className="ad-card-title">
                <div className="ad-card-title-icon">
                  <RiLeafLine size={16} color="#f16363" />
                </div>
                <div>
                  <h2>Recent Leave Requests</h2>
                  <p>{recentLeaves.length} latest requests</p>
                </div>
              </div>
              <Link to="/admin-leaves" className="ad-view-all">
                View All <FiArrowRight size={14} />
              </Link>
            </div>

            {recentLeaves.length === 0 ? (
              <div className="ad-empty">
                <div className="ad-empty-icon">
                  <HiOutlineBell size={32} color="#cbd5e1" />
                </div>
                <p>No leave requests found</p>
                <span>All clear! No pending requests.</span>
              </div>
            ) : (
              <div className="ad-leave-list">
                {recentLeaves.map((leave, idx) => {
                  const typeStyle = leaveTypeStyle(leave.leaveType);
                  return (
                    <div key={leave._id} className="ad-leave-row">
                      {/* Index */}
                      <span className="ad-leave-index">{idx + 1}</span>

                      {/* Avatar */}
                      <div className="ad-leave-avatar">
                        {leave.employee?.name?.charAt(0).toUpperCase()}
                      </div>

                      {/* Employee info */}
                      <div className="ad-leave-info">
                        <p className="ad-leave-name">{leave.employee?.name}</p>
                        <p className="ad-leave-dept">{leave.employee?.department || "—"}</p>
                      </div>

                      {/* Leave type pill */}
                      <div
                        className="ad-leave-type"
                        style={{ background: typeStyle.bg, color: typeStyle.color }}
                      >
                        {typeStyle.label}
                      </div>

                      {/* Days */}
                      <div className="ad-leave-days">
                        <HiOutlineCalendar size={13} />
                        <span>{leave.totalDays}d</span>
                      </div>

                      {/* Date range */}
                      <div className="ad-leave-range">
                        {new Date(leave.startDate).toLocaleDateString("en-US", {
                          day: "numeric", month: "short",
                        })}
                        <FiArrowRight size={11} />
                        {new Date(leave.endDate).toLocaleDateString("en-US", {
                          day: "numeric", month: "short",
                        })}
                      </div>

                      {/* Status */}
                      <StatusBadge status={leave.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right Column ──────────────────────────────────────────────── */}
          <div className="ad-right-col">

            {/* Quick Summary */}
            <div className="ad-card">
              <div className="ad-card-header">
                <div className="ad-card-title">
                  <div className="ad-card-title-icon">
                    <HiOutlineChartBar size={16} color="#f16363" />
                  </div>
                  <div>
                    <h2>Quick Summary</h2>
                    <p>Today's overview</p>
                  </div>
                </div>
              </div>

              <div className="ad-summary-list">
                {[
                  {
                    icon: MdOutlinePendingActions,
                    iconColor: "#f59e0b",
                    iconBg: "#fff7ed",
                    label: "Pending Approvals",
                    value: stats.pendingLeaves,
                    valueColor: "#f59e0b",
                  },
                  {
                    icon: HiOutlineCheckCircle,
                    iconColor: "#10b981",
                    iconBg: "#f0fdf4",
                    label: "Approved Leaves",
                    value: stats.approvedLeaves,
                    valueColor: "#10b981",
                  },
                  {
                    icon: HiOutlineUsers,
                    iconColor: "#f16363",
                    iconBg: "#eff6ff",
                    label: "Active Employees",
                    value: stats.activeEmployees,
                    valueColor: "#f16363",
                  },
                  {
                    icon: BsPersonCheck,
                    iconColor: "#059669",
                    iconBg: "#ecfdf5",
                    label: "Present Today",
                    value: stats.presentToday,
                    valueColor: "#059669",
                  },
                  {
                    icon: HiOutlineOfficeBuilding,
                    iconColor: "#ec4899",
                    iconBg: "#fdf2f8",
                    label: "Total Departments",
                    value: stats.totalDepartments,
                    valueColor: "#ec4899",
                  },
                ].map(({ icon: Icon, iconColor, iconBg, label, value, valueColor }) => (
                  <div key={label} className="ad-summary-row">
                    <div className="ad-summary-left">
                      <div
                        className="ad-summary-icon"
                        style={{ background: iconBg }}
                      >
                        <Icon size={15} color={iconColor} />
                      </div>
                      <span className="ad-summary-label">{label}</span>
                    </div>
                    <span
                      className="ad-summary-value"
                      style={{ color: valueColor }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Rate Card */}
            <div className="ad-card ad-rate-card">
              <div className="ad-card-header">
                <div className="ad-card-title">
                  <div className="ad-card-title-icon">
                    <HiOutlineClock size={16} color="#f16363" />
                  </div>
                  <div>
                    <h2>Attendance Rate</h2>
                    <p>Today vs total staff</p>
                  </div>
                </div>
              </div>

              <div className="ad-rate-body">
                <div className="ad-rate-circle-wrap">
                  {/* SVG Donut */}
                  {(() => {
                    const pct = stats.totalEmployees
                      ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
                      : 0;
                    const r   = 54;
                    const circ = 2 * Math.PI * r;
                    const dash = (pct / 100) * circ;
                    return (
                      <div className="ad-donut-wrap">
                        <svg width="140" height="140" viewBox="0 0 140 140">
                          <circle
                            cx="70" cy="70" r={r}
                            fill="none" stroke="#e5e7eb" strokeWidth="14"
                          />
                          <circle
                            cx="70" cy="70" r={r}
                            fill="none"
                            stroke="url(#donutGrad)"
                            strokeWidth="14"
                            strokeLinecap="round"
                            strokeDasharray={`${dash} ${circ}`}
                            strokeDashoffset={circ / 4}
                            style={{ transition: "stroke-dasharray 0.8s ease" }}
                          />
                          <defs>
                            <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%"   stopColor="#f16363" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="ad-donut-center">
                          <span className="ad-donut-pct">{pct}%</span>
                          <span className="ad-donut-sub">Present</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="ad-rate-legend">
                  {[
                    { color: "#f16363", label: "Present", value: stats.presentToday },
                    { color: "#e5e7eb", label: "Absent",
                      value: Math.max(0, stats.totalEmployees - stats.presentToday) },
                  ].map(({ color, label, value }) => (
                    <div key={label} className="ad-rate-legend-item">
                      <span className="ad-rate-dot" style={{ background: color }} />
                      <span className="ad-rate-leg-label">{label}</span>
                      <span className="ad-rate-leg-val">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDash;