import { useState, useEffect } from "react";
import Sidebar from "../../../component/sidebar/sidebar";
import { markAttendanceAPI, getMyAttendanceAPI } from "../../../service/api";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  HiOutlineClock,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineArrowRightCircle,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import {
  BsPersonCheck,
  BsPersonX,
  BsClockHistory,
  BsCheckCircleFill,
  BsXCircleFill,
} from "react-icons/bs";
import {
  MdOutlineWbTwilight,
  MdOutlineHourglassEmpty,
} from "react-icons/md";
import { TbClockExclamation, TbClockCheck, TbClockX } from "react-icons/tb";
import { RiTimeLine } from "react-icons/ri";
import { FiArrowRight } from "react-icons/fi";

import "./empAttendance.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    present:    { icon: BsPersonCheck,       cls: "ea-badge-present",  label: "Present"  },
    late:       { icon: TbClockExclamation,  cls: "ea-badge-late",     label: "Late"     },
    absent:     { icon: BsPersonX,           cls: "ea-badge-absent",   label: "Absent"   },
    "half-day": { icon: MdOutlineWbTwilight, cls: "ea-badge-halfday",  label: "Half Day" },
  }[status] ?? { icon: BsPersonX, cls: "ea-badge-absent", label: status };

  const Icon = cfg.icon;
  return (
    <span className={`ea-status-badge ${cfg.cls}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, lightBg, textColor, gradient }) => (
  <div className="ea-stat-card">
    <div className="ea-stat-icon" style={{ background: lightBg }}>
      <Icon size={22} color={textColor} />
    </div>
    <div className="ea-stat-body">
      <h3 className="ea-stat-value" style={{ color: textColor }}>{value}</h3>
      <p className="ea-stat-label">{label}</p>
    </div>
    <div className="ea-stat-glow" style={{ background: gradient }} />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const EmployeeAttendance = () => {
  const now = new Date();

  const [data, setData]         = useState({ todayAttendance: null, attendance: [] });
  const [loading, setLoading]   = useState(true);
  const [marking, setMarking]   = useState(false);
  const [notification, setNotification] = useState(null);
  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year, setYear]         = useState(now.getFullYear());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await getMyAttendanceAPI({ month, year });
      setData(res.data);
    } catch {
      notify("Failed to fetch attendance", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, [month, year]);

  const handleMark = async () => {
    setMarking(true);
    try {
      const res = await markAttendanceAPI({});
      notify(res.data.message);
      fetchAttendance();
    } catch (err) {
      notify(err.response?.data?.message || "Failed", "error");
    } finally {
      setMarking(false);
    }
  };

  const fmt = (d) =>
    d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";

  const today     = data.todayAttendance;
  const checkedIn = today && !today.checkOut;
  const done      = today && !!today.checkOut;

  const totalHours = data.attendance
    .reduce((s, r) => s + (r.workHours || 0), 0)
    .toFixed(1);

  const statCards = [
    { label: "Present Days", value: data.attendance.filter(r => r.status === "present").length,
      icon: BsPersonCheck, lightBg: "#d1fae5", textColor: "#059669",
      gradient: "linear-gradient(135deg,#10b981,#059669)" },
    { label: "Late Days", value: data.attendance.filter(r => r.status === "late").length,
      icon: TbClockExclamation, lightBg: "#fef3c7", textColor: "#d97706",
      gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { label: "Total Records", value: data.attendance.length,
      icon: HiOutlineCalendarDays, lightBg: "#e0e7ff", textColor: "#4f46e5",
      gradient: "linear-gradient(135deg,#f16363,#4f46e5)" },
    { label: "Total Hours", value: `${totalHours}h`,
      icon: BsClockHistory, lightBg: "#ede9fe", textColor: "#7c3aed",
      gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  ];

  return (
    <div className="ea-layout">
      <Sidebar />
      <main className="ea-main">

        {/* Notification */}
        {notification && (
          <div className={`ea-notification ${notification.type}`}>
            {notification.type === "success"
              ? <BsCheckCircleFill size={16} />
              : <BsXCircleFill size={16} />}
            {notification.message}
          </div>
        )}

        {/* Page Header */}
        <div className="ea-topbar">
          <div className="ea-header-left">
            <div className="ea-title-icon">
              <BsClockHistory size={26} color="#f16363" />
            </div>
            <div>
              <h1>My Attendance</h1>
              <p>Track your daily check-in and check-out</p>
            </div>
          </div>
        </div>

        {/* ── Check-in Hero Widget ──────────────────────────────────────────── */}
        <div className="ea-hero-widget">
          <div className="ea-hero-left">
            <div className="ea-live-clock">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit", second: "2-digit",
              })}
            </div>
            <p className="ea-hero-date">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long", day: "numeric",
                month: "long", year: "numeric",
              })}
            </p>

            {/* Today chips */}
            {today ? (
              <div className="ea-today-chips">
                <div className="ea-chip check-in-chip">
                  <TbClockCheck size={15} />
                  <span>In: {fmt(today.checkIn)}</span>
                </div>
                {today.checkOut && (
                  <div className="ea-chip check-out-chip">
                    <TbClockX size={15} />
                    <span>Out: {fmt(today.checkOut)}</span>
                  </div>
                )}
                {today.workHours > 0 && (
                  <div className="ea-chip hours-chip">
                    <BsClockHistory size={13} />
                    <span>{today.workHours}h worked</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="ea-not-checked">
                You haven't checked in yet today
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="ea-hero-right">
            <div className={`ea-ring-wrap ${checkedIn ? "ring-out" : done ? "ring-done" : "ring-in"}`}>
              <div className="ea-ring-outer" />
              <div className="ea-ring-inner">
                <span className="ea-ring-label">
                  {done ? "Done" : checkedIn ? "OUT" : "IN"}
                </span>
              </div>
            </div>
            <button
              className={`ea-mark-btn ${done ? "btn-done" : checkedIn ? "btn-out" : "btn-in"}`}
              onClick={handleMark}
              disabled={done || marking}
            >
              {marking ? (
                <><div className="ea-btn-spinner" /> Processing…</>
              ) : done ? (
                <><HiOutlineCheckCircle size={18} /> Done for Today</>
              ) : checkedIn ? (
                <><TbClockX size={18} /> Check Out</>
              ) : (
                <><TbClockCheck size={18} /> Check In</>
              )}
            </button>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        <div className="ea-stats-grid">
          {statCards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>

        {/* ── Filters ────────────────────────────────────────────────────────── */}
        <div className="ea-filters-row">
          <div className="ea-select-wrap">
            <HiOutlineCalendarDays size={16} color="#94a3b8" />
            <select
              className="ea-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <HiOutlineChevronDown size={14} color="#94a3b8" />
          </div>

          <div className="ea-select-wrap">
            <HiOutlineClock size={16} color="#94a3b8" />
            <select
              className="ea-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2023, 2024, 2025].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <HiOutlineChevronDown size={14} color="#94a3b8" />
          </div>

          <div className="ea-records-count">
            {data.attendance.length} record{data.attendance.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <div className="ea-table-card">
          {loading ? (
            <div className="ea-loader">
              <div className="ea-loader-ring" />
              <p>Loading records…</p>
            </div>
          ) : data.attendance.length === 0 ? (
            <div className="ea-empty">
              <div className="ea-empty-icon">
                <MdOutlineHourglassEmpty size={44} color="#cbd5e1" />
              </div>
              <h3>No records found</h3>
              <p>No attendance data for {MONTHS[month - 1]} {year}</p>
            </div>
          ) : (
            <table className="ea-table">
              <thead>
                <tr>
                  <th>
                    <div className="ea-th">
                      <HiOutlineCalendarDays size={14} /> Date
                    </div>
                  </th>
                  <th>
                    <div className="ea-th">
                      <TbClockCheck size={14} /> Check In
                    </div>
                  </th>
                  <th>
                    <div className="ea-th">
                      <TbClockX size={14} /> Check Out
                    </div>
                  </th>
                  <th>
                    <div className="ea-th">
                      <BsClockHistory size={13} /> Hours
                    </div>
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.attendance.map((r) => (
                  <tr key={r._id} className="ea-row">
                    <td>
                      <div className="ea-date-cell">
                        <span className="ea-date-weekday">
                          {new Date(r.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span className="ea-date-full">
                          {new Date(r.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="ea-time-cell in">
                        <RiTimeLine size={14} />
                        {fmt(r.checkIn)}
                      </div>
                    </td>
                    <td>
                      <div className="ea-time-cell out">
                        <RiTimeLine size={14} />
                        {fmt(r.checkOut)}
                      </div>
                    </td>
                    <td>
                      {r.workHours ? (
                        <div className="ea-hours-wrap">
                          <div
                            className="ea-hours-bar"
                            style={{ width: `${Math.min((r.workHours / 9) * 100, 100)}%` }}
                          />
                          <span>{r.workHours}h</span>
                        </div>
                      ) : (
                        <span className="ea-no-data">—</span>
                      )}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  );
};

export default EmployeeAttendance;