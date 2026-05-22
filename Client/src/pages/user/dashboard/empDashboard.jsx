import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../component/sidebar/sidebar";
import { useAuth } from "../../../context/AuthContext";
import {
  getMyAttendanceAPI,
  getMyLeavesAPI,
  markAttendanceAPI,
} from "../../../service/api";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import {
  MdOutlinePendingActions,
  MdOutlineCheckCircle,
  MdOutlineHourglassEmpty,
} from "react-icons/md";
import {
  BsPersonCheck,
  BsClockHistory,
  BsCheckCircleFill,
  BsXCircleFill,
  BsArrowRight,
} from "react-icons/bs";
import { TbClockCheck, TbClockX } from "react-icons/tb";
import { RiLeafLine } from "react-icons/ri";
import { FiArrowRight } from "react-icons/fi";

import "./empDashboard.css";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, gradient, lightBg, textColor }) => (
  <div className="ed-stat-card">
    <div className="ed-stat-icon" style={{ background: lightBg }}>
      <Icon size={22} color={textColor} />
    </div>
    <div className="ed-stat-body">
      <h3 className="ed-stat-value" style={{ color: textColor }}>{value}</h3>
      <p className="ed-stat-label">{title}</p>
    </div>
    <div className="ed-stat-glow" style={{ background: gradient }} />
  </div>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const AttBadge = ({ status }) => {
  const cfg = {
    present: { cls: "ed-badge-present", label: "Present" },
    late:    { cls: "ed-badge-late",    label: "Late"    },
    absent:  { cls: "ed-badge-absent",  label: "Absent"  },
  }[status] ?? { cls: "ed-badge-absent", label: status };
  return <span className={`ed-mini-badge ${cfg.cls}`}>{cfg.label}</span>;
};

const LeaveBadge = ({ status }) => {
  const cfg = {
    approved: { cls: "ed-badge-approved", label: "Approved" },
    rejected: { cls: "ed-badge-rejected", label: "Rejected" },
    pending:  { cls: "ed-badge-pending",  label: "Pending"  },
  }[status] ?? { cls: "ed-badge-pending", label: status };
  return <span className={`ed-mini-badge ${cfg.cls}`}>{cfg.label}</span>;
};

// ── Main Component ────────────────────────────────────────────────────────────
const EmpDashboard = () => {
  const { user } = useAuth();
  const [attData, setAttData]     = useState({ todayAttendance: null, attendance: [], total: 0 });
  const [leaveData, setLeaveData] = useState({ summary: {}, leaves: [] });
  const [loading, setLoading]     = useState(true);
  const [marking, setMarking]     = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchAll = async () => {
    const now = new Date();
    try {
      const [attRes, leaveRes] = await Promise.all([
        getMyAttendanceAPI({ month: now.getMonth() + 1, year: now.getFullYear() }),
        getMyLeavesAPI(),
      ]);
      setAttData(attRes.data);
      setLeaveData(leaveRes.data);
    } catch (err) {
      console.error("EmpDash fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAttendance = async () => {
    setMarking(true);
    try {
      const res = await markAttendanceAPI({});
      notify(res.data.message);
      fetchAll();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to mark attendance", "error");
    } finally {
      setMarking(false);
    }
  };

  const fmt = (d) =>
    d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";

  const today       = attData.todayAttendance;
  const isCheckedIn = today && !today.checkOut;
  const isFullyDone = today && !!today.checkOut;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const statCards = [
    { title: "Days This Month", value: attData.total || 0, icon: HiOutlineCalendarDays,
      gradient: "linear-gradient(135deg,#f16363,#4f46e5)", lightBg: "#e0e7ff", textColor: "#4f46e5" },
    { title: "Pending Leaves",  value: leaveData.summary?.pending  || 0, icon: MdOutlinePendingActions,
      gradient: "linear-gradient(135deg,#f59e0b,#d97706)", lightBg: "#fef3c7", textColor: "#d97706" },
    { title: "Approved Leaves", value: leaveData.summary?.approved || 0, icon: MdOutlineCheckCircle,
      gradient: "linear-gradient(135deg,#10b981,#059669)", lightBg: "#d1fae5", textColor: "#059669" },
    { title: "Total Requests",  value: leaveData.summary?.total    || 0, icon: HiOutlineClipboardDocumentList,
      gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)", lightBg: "#ede9fe", textColor: "#7c3aed" },
  ];

  if (loading) return (
    <div className="ed-layout">
      <Sidebar />
      <main className="ed-main">
        <div className="ed-loader-full">
          <div className="ed-loader-ring" />
          <p>Loading your dashboard…</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="ed-layout">
      <Sidebar />
      <main className="ed-main">

        {/* Notification */}
        {notification && (
          <div className={`ed-notification ${notification.type}`}>
            {notification.type === "success"
              ? <BsCheckCircleFill size={16} />
              : <BsXCircleFill size={16} />}
            {notification.message}
          </div>
        )}

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <div className="ed-topbar">
          <div>
            <div className="ed-greeting-badge">
              <BsClockHistory size={13} />
              <span>{new Date().toLocaleDateString("en-US", {
                weekday: "long", day: "numeric",
                month: "long", year: "numeric",
              })}</span>
            </div>
            <h1>{greeting()}, <span className="ed-name">{user?.name}</span></h1>
          </div>
        </div>

        {/* ── Attendance Hero ───────────────────────────────────────────────── */}
        <div className="ed-hero">
          <div className="ed-hero-info">
            <div className="ed-hero-label">
              <BsPersonCheck size={16} />
              Today's Attendance
            </div>

            {today ? (
              <div className="ed-hero-times">
                <div className="ed-time-block">
                  <TbClockCheck size={18} color="#10b981" />
                  <div>
                    <span className="ed-time-caption">Check In</span>
                    <span className="ed-time-val">{fmt(today.checkIn)}</span>
                  </div>
                </div>
                {today.checkOut && (
                  <>
                    <FiArrowRight size={18} color="rgba(255,255,255,.3)" />
                    <div className="ed-time-block">
                      <TbClockX size={18} color="#a5b4fc" />
                      <div>
                        <span className="ed-time-caption">Check Out</span>
                        <span className="ed-time-val">{fmt(today.checkOut)}</span>
                      </div>
                    </div>
                  </>
                )}
                {today.workHours > 0 && (
                  <>
                    <div className="ed-divider" />
                    <div className="ed-time-block">
                      <BsClockHistory size={17} color="#fcd34d" />
                      <div>
                        <span className="ed-time-caption">Hours</span>
                        <span className="ed-time-val">{today.workHours}h</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="ed-not-checked">
                You haven't checked in yet today
              </p>
            )}
          </div>

          <button
            className={`ed-att-btn ${
              isFullyDone ? "btn-done" : isCheckedIn ? "btn-out" : "btn-in"
            }`}
            onClick={handleAttendance}
            disabled={isFullyDone || marking}
          >
            {marking ? (
              <><div className="ed-btn-spin" /> Processing…</>
            ) : isFullyDone ? (
              <><HiOutlineCheckCircle size={18} /> Done for Today</>
            ) : isCheckedIn ? (
              <><TbClockX size={18} /> Check Out</>
            ) : (
              <><TbClockCheck size={18} /> Check In</>
            )}
          </button>
        </div>

        {/* ── Stats Grid ───────────────────────────────────────────────────── */}
        <div className="ed-stats-grid">
          {statCards.map((card) => <StatCard key={card.title} {...card} />)}
        </div>

        {/* ── Recent Records ────────────────────────────────────────────────── */}
        <div className="ed-records-grid">

          {/* Attendance */}
          <div className="ed-card">
            <div className="ed-card-header">
              <div className="ed-card-title">
                <div className="ed-card-icon-wrap">
                  <BsClockHistory size={16} color="#f16363" />
                </div>
                <div>
                  <h2>Recent Attendance</h2>
                  <p>This month's records</p>
                </div>
              </div>
              <Link to="/mark-attendance" className="ed-view-all">
                View All <BsArrowRight size={13} />
              </Link>
            </div>

            {attData.attendance.length === 0 ? (
              <div className="ed-empty">
                <MdOutlineHourglassEmpty size={32} color="#cbd5e1" />
                <p>No attendance records yet</p>
              </div>
            ) : (
              <div className="ed-list">
                {attData.attendance.slice(0, 5).map((r) => (
                  <div key={r._id} className="ed-list-row">
                    <div className="ed-row-icon att-icon">
                      <BsClockHistory size={14} />
                    </div>
                    <div className="ed-row-info">
                      <p className="ed-row-title">
                        {new Date(r.date).toLocaleDateString("en-US", { day: "numeric", month: "short", weekday: "short" })}
                      </p>
                      <p className="ed-row-sub">{fmt(r.checkIn)} → {fmt(r.checkOut)}</p>
                    </div>
                    <AttBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaves */}
          <div className="ed-card">
            <div className="ed-card-header">
              <div className="ed-card-title">
                <div className="ed-card-icon-wrap">
                  <RiLeafLine size={16} color="#f16363" />
                </div>
                <div>
                  <h2>Recent Leaves</h2>
                  <p>Your leave applications</p>
                </div>
              </div>
              <Link to="/my-leaves" className="ed-view-all">
                View All <BsArrowRight size={13} />
              </Link>
            </div>

            {leaveData.leaves.length === 0 ? (
              <div className="ed-empty">
                <MdOutlineHourglassEmpty size={32} color="#cbd5e1" />
                <p>No leave requests yet</p>
              </div>
            ) : (
              <div className="ed-list">
                {leaveData.leaves.slice(0, 5).map((l) => (
                  <div key={l._id} className="ed-list-row">
                    <div className="ed-row-icon leave-icon">
                      <RiLeafLine size={14} />
                    </div>
                    <div className="ed-row-info">
                      <p className="ed-row-title" style={{ textTransform: "capitalize" }}>
                        {l.leaveType} Leave
                      </p>
                      <p className="ed-row-sub">
                        {l.totalDays} day(s) · {new Date(l.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <LeaveBadge status={l.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default EmpDashboard;