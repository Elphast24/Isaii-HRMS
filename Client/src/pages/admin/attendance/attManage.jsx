import { useState, useEffect } from "react";
import Sidebar from "../../../component/sidebar/sidebar";
import { getAllAttendanceAPI } from "../../../service/api";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineCalendar,
  HiArrowPath,
  HiOutlineFunnel,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import {
  MdOutlineHourglassEmpty,
  MdOutlineWbTwilight,
} from "react-icons/md";
import {
  BsPersonCheck,
  BsClockHistory,
  BsPersonX,
} from "react-icons/bs";
import { TbClockExclamation } from "react-icons/tb";
import { FiArrowRight } from "react-icons/fi";
import { RiTimeLine } from "react-icons/ri";

import "./attManage.css";

// ── Stat Card Component ───────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, gradient, lightBg, textColor }) => (
  <div className="att-stat-card">
    <div className="att-stat-icon" style={{ background: lightBg }}>
      <Icon size={22} color={textColor} />
    </div>
    <div className="att-stat-body">
      <h3 className="att-stat-value" style={{ color: textColor }}>{value}</h3>
      <p className="att-stat-label">{label}</p>
    </div>
    <div className="att-stat-glow" style={{ background: gradient }} />
  </div>
);

// ── Status Badge Component ─────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    present:  { icon: BsPersonCheck,        cls: "att-badge-present",  label: "Present"  },
    late:     { icon: TbClockExclamation,   cls: "att-badge-late",     label: "Late"     },
    absent:   { icon: BsPersonX,            cls: "att-badge-absent",   label: "Absent"   },
    "half-day": { icon: MdOutlineWbTwilight, cls: "att-badge-halfday", label: "Half Day" },
  };
  const { icon: Icon, cls, label } = config[status] ?? config.absent;

  return (
    <span className={`att-status-badge ${cls}`}>
      <Icon size={13} />
      {label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AttendanceManagement = () => {
  const [attendance, setAttendance]   = useState([]);
  const [summary, setSummary]         = useState({});
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [dateFilter, setDateFilter]   = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm]   = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAttendance = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = dateFilter ? { date: dateFilter } : {};
      const res    = await getAllAttendanceAPI(params);
      setAttendance(res.data.attendance || []);
      setSummary(res.data.summary       || {});
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Attendance fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, [dateFilter]);

  // ── Format time helper ────────────────────────────────────────────────────
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  // ── Client-side search filter ─────────────────────────────────────────────
  const filtered = attendance.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.employee?.name?.toLowerCase().includes(q) ||
      r.employee?.email?.toLowerCase().includes(q) ||
      r.employee?.department?.toLowerCase().includes(q)
    );
  });

  // ── Stat card data ────────────────────────────────────────────────────────
  const statCards = [
    {
      label:     "Present",
      value:     summary.presentCount  || 0,
      icon:      BsPersonCheck,
      gradient:  "linear-gradient(135deg,#10b981,#059669)",
      lightBg:   "#d1fae5",
      textColor: "#059669",
    },
    {
      label:     "Late",
      value:     summary.lateCount     || 0,
      icon:      TbClockExclamation,
      gradient:  "linear-gradient(135deg,#f59e0b,#d97706)",
      lightBg:   "#fef3c7",
      textColor: "#d97706",
    },
    {
      label:     "Absent",
      value:     summary.absentCount   || 0,
      icon:      BsPersonX,
      gradient:  "linear-gradient(135deg,#ef4444,#dc2626)",
      lightBg:   "#fee2e2",
      textColor: "#dc2626",
    },
    {
      label:     "Half Day",
      value:     summary.halfDayCount  || 0,
      icon:      MdOutlineWbTwilight,
      gradient:  "linear-gradient(135deg,#8b5cf6,#7c3aed)",
      lightBg:   "#ede9fe",
      textColor: "#7c3aed",
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="att-layout">
      <Sidebar />
      <main className="att-main">

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <div className="att-topbar">
          <div className="att-header-left">
            <div className="att-title-icon">
              <HiOutlineUserGroup size={28} color="#f16363" />
            </div>
            <div>
              <div className="att-title-badge">
                <BsClockHistory size={13} />
                <span>Attendance Tracker</span>
              </div>
              <h1>Attendance Management</h1>
              <p>Track and monitor employee attendance records</p>
            </div>
          </div>

          <div className="att-header-right">
            <div className="att-last-updated">
              <HiOutlineClock size={13} />
              <span>
                Updated{" "}
                {lastUpdated.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <button
              className={`att-refresh-btn ${refreshing ? "spinning" : ""}`}
              onClick={() => fetchAttendance(true)}
              disabled={refreshing}
              title="Refresh records"
            >
              <HiArrowPath size={17} />
            </button>
          </div>
        </div>

        {/* ── Stat Cards ────────────────────────────────────────────────────── */}
        <div className="att-stats-grid">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* ── Filters Row ──────────────────────────────────────────────────── */}
        <div className="att-filters-card">
          <div className="att-filters-left">
            {/* Search */}
            <div className="att-search-box">
              <HiOutlineMagnifyingGlass size={17} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by name, email, department…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="att-search-input"
              />
              {searchTerm && (
                <button
                  className="att-clear-btn"
                  onClick={() => setSearchTerm("")}
                >
                  ×
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="att-date-wrap">
              <HiOutlineCalendar size={16} color="#94a3b8" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="att-date-input"
              />
            </div>
          </div>

          <div className="att-filters-right">
            {dateFilter && (
              <div className="att-active-filter">
                <HiOutlineFunnel size={13} />
                <span>
                  {new Date(dateFilter).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <button
                  className="att-remove-filter"
                  onClick={() => setDateFilter("")}
                  title="Remove date filter"
                >
                  ×
                </button>
              </div>
            )}

            <div className="att-results-count">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <div className="att-table-card">
          {loading ? (
            <div className="att-loader">
              <div className="att-loader-ring" />
              <p>Loading attendance records…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="att-empty">
              <div className="att-empty-icon">
                <MdOutlineHourglassEmpty size={48} color="#cbd5e1" />
              </div>
              <h3>No records found</h3>
              <p>
                {searchTerm
                  ? "Try adjusting your search terms"
                  : dateFilter
                  ? "No attendance data for the selected date"
                  : "No attendance records available"}
              </p>
              {(searchTerm || dateFilter) && (
                <button
                  className="att-clear-all-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("");
                  }}
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="att-table-wrap">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>
                      <div className="att-th-inner">
                        <HiOutlineUserGroup size={14} />
                        Employee
                      </div>
                    </th>
                    <th>Department</th>
                    <th>
                      <div className="att-th-inner">
                        <HiOutlineCalendar size={14} />
                        Date
                      </div>
                    </th>
                    <th>
                      <div className="att-th-inner">
                        <RiTimeLine size={14} />
                        Check In
                      </div>
                    </th>
                    <th>
                      <div className="att-th-inner">
                        <RiTimeLine size={14} />
                        Check Out
                      </div>
                    </th>
                    <th>
                      <div className="att-th-inner">
                        <HiOutlineClock size={14} />
                        Hours
                      </div>
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, index) => (
                    <tr key={r._id} className="att-row">

                      {/* Employee Cell */}
                      <td>
                        <div className="att-emp-cell">
                          <div className="att-avatar">
                            {r.employee?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="att-emp-info">
                            <p className="att-emp-name">{r.employee?.name}</p>
                            <p className="att-emp-email">{r.employee?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span className="att-dept-pill">
                          {r.employee?.department || "—"}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <div className="att-date-cell">
                          <span className="att-date-day">
                            {new Date(r.date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </span>
                          <span className="att-date-full">
                            {new Date(r.date).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Check In */}
                      <td>
                        <div className="att-time-cell check-in">
                          <RiTimeLine size={14} />
                          <span>{fmt(r.checkIn)}</span>
                        </div>
                      </td>

                      {/* Check Out */}
                      <td>
                        <div className="att-time-cell check-out">
                          <RiTimeLine size={14} />
                          <span>{fmt(r.checkOut)}</span>
                        </div>
                      </td>

                      {/* Work Hours */}
                      <td>
                        {r.workHours ? (
                          <div className="att-hours-cell">
                            <div
                              className="att-hours-bar"
                              style={{
                                width: `${Math.min((r.workHours / 9) * 100, 100)}%`,
                              }}
                            />
                            <span>{r.workHours}h</span>
                          </div>
                        ) : (
                          <span className="att-no-data">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <StatusBadge status={r.status} />
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default AttendanceManagement;