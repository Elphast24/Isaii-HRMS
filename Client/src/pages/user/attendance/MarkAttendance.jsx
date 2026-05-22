import { useState, useEffect } from "react";
import Sidebar from "../../../component/sidebar/sidebar";
import { markAttendanceAPI, getMyAttendanceAPI } from "../../../service/api";
import "../../admin/dashboard/adminDash.css";
import "./markAttendance.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const MarkAttendance = () => {
  const now = new Date();
  const [data, setData]           = useState({ todayAttendance: null, attendance: [] });
  const [loading, setLoading]     = useState(true);
  const [marking, setMarking]     = useState(false);
  const [notification, setNotification] = useState(null);
  const [month, setMonth]         = useState(now.getMonth() + 1);
  const [year, setYear]           = useState(now.getFullYear());

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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
    d ? new Date(d).toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" }) : "—";

  const today      = data.todayAttendance;
  const checkedIn  = today && !today.checkOut;
  const done       = today && !!today.checkOut;

  const totalHours = data.attendance
    .reduce((s, r) => s + (r.workHours || 0), 0)
    .toFixed(1);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.type === "success" ? "" : ""} {notification.message}
          </div>
        )}

        <div className="page-header">
          <div><h1>My Attendance</h1><p>Track your daily attendance</p></div>
        </div>

        {/* Check-in Widget */}
        <div className="checkin-widget">
          <div className="checkin-left">
            <div className="current-time">
              {now.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
            </div>
            <p className="current-date">
              {now.toLocaleDateString("en-US", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>
            {today && (
              <div className="today-status">
                <div className="status-chip"> In: {fmt(today.checkIn)}</div>
                {today.checkOut && <div className="status-chip">Out: {fmt(today.checkOut)}</div>}
                {today.workHours > 0 && <div className="status-chip">{today.workHours}h</div>}
              </div>
            )}
          </div>
          <div className="checkin-right">
            <div className={`checkin-circle ${checkedIn ? "checked-in" : done ? "done" : ""}`}>
              <span>{done ? "✓" : checkedIn ? "OUT" : "IN"}</span>
            </div>
            <button
              className="checkin-btn"
              onClick={handleMark}
              disabled={done || marking}
            >
              {marking ? "Processing…" : done ? "Done for Today" : checkedIn ? "Check Out" : "Check In"}
            </button>
          </div>
        </div>

        {/* Month Stats */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label:"Present", value: data.attendance.filter(r => r.status==="present").length, icon:"", color:"green"  },
            { label:"Late",    value: data.attendance.filter(r => r.status==="late").length,    icon:"", color:"yellow" },
            { label:"Records", value: data.attendance.length,                                   icon:"", color:"blue"   },
            { label:"Hours",   value: `${totalHours}h`,                                         icon:"", color:"purple" },
          ].map((s) => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-content">
                <h3 className="stat-value">{s.value}</h3>
                <p className="stat-title">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="filters-bar" style={{ marginBottom: 20 }}>
          <select className="filter-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="filter-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2023, 2024, 2025].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div className="loading-screen"><div className="spinner" /></div>
          ) : data.attendance.length === 0 ? (
            <div className="empty-state"><span>📋</span><p>No records for this period</p></div>
          ) : (
            <table className="emp-table">
              <thead>
                <tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.attendance.map((r) => (
                  <tr key={r._id}>
                    <td>
                      {new Date(r.date).toLocaleDateString("en-US", { weekday:"short", day:"numeric", month:"short" })}
                    </td>
                    <td>{fmt(r.checkIn)}</td>
                    <td>{fmt(r.checkOut)}</td>
                    <td>{r.workHours ? `${r.workHours}h` : "—"}</td>
                    <td>
                      <span className={`badge ${
                        r.status==="present"  ? "badge-success" :
                        r.status==="late"     ? "badge-warning" :
                        r.status==="half-day" ? "badge-info"    : "badge-danger"
                      }`}>
                        {r.status}
                      </span>
                    </td>
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

export default MarkAttendance;