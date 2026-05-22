import { useState, useEffect } from "react";
import Sidebar from "../../../component/Sidebar/sidebar";
import { applyLeaveAPI, getMyLeavesAPI } from "../../../service/api";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftRight,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineHeart,
  HiOutlineSun,
  HiGlobeEuropeAfrica,
  HiOutlineUserGroup,
  HiOutlineBanknotes,
} from "react-icons/hi2";
import {
  MdOutlinePendingActions,
  MdOutlineCheckCircle,
  MdOutlineCancel,
  MdOutlineHourglassEmpty,
} from "react-icons/md";
import {
  BsCheckCircleFill,
  BsXCircleFill,
  BsClipboardCheck,
} from "react-icons/bs";
import { RiLeafLine } from "react-icons/ri";
import { FiArrowRight, FiSend } from "react-icons/fi";

import "./applyLeave.css";

const INITIAL = { leaveType: "", startDate: "", endDate: "", reason: "" };

const typeConfig = {
  sick:      { color: "#ef4444", bg: "#fef2f2", label: "Sick Leave",      icon: HiOutlineHeart },
  casual:    { color: "#3b82f6", bg: "#eff6ff", label: "Casual Leave",    icon: HiOutlineSun },
  annual:    { color: "#10b981", bg: "#ecfdf5", label: "Annual Leave",    icon: HiGlobeEuropeAfrica },
  maternity: { color: "#f59e0b", bg: "#fffbeb", label: "Maternity Leave", icon: HiOutlineUserGroup },
  unpaid:    { color: "#64748b", bg: "#f8fafc", label: "Unpaid Leave",    icon: HiOutlineBanknotes },
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, lightBg, textColor, gradient }) => (
  <div className="al-stat-card">
    <div className="al-stat-icon" style={{ background: lightBg }}>
      <Icon size={20} color={textColor} />
    </div>
    <div>
      <h3 className="al-stat-value" style={{ color: textColor }}>{value}</h3>
      <p className="al-stat-label">{label}</p>
    </div>
    <div className="al-stat-glow" style={{ background: gradient }} />
  </div>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:  { cls: "al-badge-pending",  icon: MdOutlinePendingActions, label: "Pending"  },
    approved: { cls: "al-badge-approved", icon: MdOutlineCheckCircle,    label: "Approved" },
    rejected: { cls: "al-badge-rejected", icon: MdOutlineCancel,         label: "Rejected" },
  }[status] ?? { cls: "al-badge-pending", icon: MdOutlinePendingActions, label: status };
  const Icon = cfg.icon;
  return (
    <span className={`al-status-badge ${cfg.cls}`}>
      <Icon size={13} />{cfg.label}
    </span>
  );
};

// ── Leave History Card ────────────────────────────────────────────────────────
const HistoryCard = ({ leave }) => {
  const cfg = typeConfig[leave.leaveType] || typeConfig.casual;
  const Icon = cfg.icon;
  return (
    <div className="al-history-card">
      <div className="al-history-top">
        <div className="al-history-type" style={{ background: cfg.bg, color: cfg.color }}>
          <Icon size={14} />
          <span>{cfg.label}</span>
        </div>
        <StatusBadge status={leave.status} />
      </div>
      <div className="al-history-dates">
        <HiOutlineCalendarDays size={14} color="#94a3b8" />
        <span>
          {new Date(leave.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          {" → "}
          {new Date(leave.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <span className="al-days-pill">{leave.totalDays}d</span>
      </div>
      <p className="al-history-reason">{leave.reason}</p>
      {leave.rejectionReason && (
        <div className="al-rejection-note">
          <HiOutlineExclamationTriangle size={14} />
          <span>{leave.rejectionReason}</span>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ApplyLeave = () => {
  const [formData, setFormData]   = useState(INITIAL);
  const [leaves, setLeaves]       = useState([]);
  const [summary, setSummary]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formError, setFormError] = useState("");

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchLeaves = async () => {
    try {
      const res = await getMyLeavesAPI();
      setLeaves(res.data.leaves   || []);
      setSummary(res.data.summary || {});
    } catch {
      notify("Failed to fetch leave records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const totalDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const diff = new Date(formData.endDate) - new Date(formData.startDate);
    return diff >= 0 ? Math.ceil(diff / 86400000) + 1 : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await applyLeaveAPI(formData);
      notify("Leave application submitted successfully!");
      setFormData(INITIAL);
      fetchLeaves();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const statCards = [
    { label: "Pending",  value: summary.pending  || 0, icon: MdOutlinePendingActions,
      gradient:"linear-gradient(135deg,#f59e0b,#d97706)", lightBg:"#fef3c7", textColor:"#d97706" },
    { label: "Approved", value: summary.approved || 0, icon: MdOutlineCheckCircle,
      gradient:"linear-gradient(135deg,#10b981,#059669)", lightBg:"#d1fae5", textColor:"#059669" },
    { label: "Rejected", value: summary.rejected || 0, icon: MdOutlineCancel,
      gradient:"linear-gradient(135deg,#ef4444,#dc2626)", lightBg:"#fee2e2", textColor:"#dc2626" },
    { label: "Total",    value: summary.total    || 0, icon: BsClipboardCheck,
      gradient:"linear-gradient(135deg,#f16363,#4f46e5)", lightBg:"#e0e7ff", textColor:"#4f46e5" },
  ];

  return (
    <div className="al-layout">
      <Sidebar />
      <main className="al-main">

        {/* Notification */}
        {notification && (
          <div className={`al-notification ${notification.type}`}>
            {notification.type === "success"
              ? <BsCheckCircleFill size={16} />
              : <BsXCircleFill size={16} />}
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="al-topbar">
          <div className="al-header-left">
            <div className="al-title-icon">
              <RiLeafLine size={26} color="#f16363" />
            </div>
            <div>
              <h1>Leave Management</h1>
              <p>Apply for leave and track your requests</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="al-stats-grid">
          {statCards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>

        {/* Content */}
        <div className="al-content-grid">

          {/* ── Apply Form ────────────────────────────────────────────────── */}
          <div className="al-form-card">
            <div className="al-form-card-header">
              <div className="al-form-icon">
                <FiSend size={18} color="#f16363" />
              </div>
              <div>
                <h2>Apply for Leave</h2>
                <p>Fill in the details below</p>
              </div>
            </div>

            {formError && (
              <div className="al-form-error">
                <HiOutlineExclamationTriangle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="al-form">
              {/* Leave Type */}
              <div className="al-field">
                <label htmlFor="leaveType">
                  <RiLeafLine size={15} /> Leave Type *
                </label>
                <select
                  id="leaveType"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select leave type…</option>
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="al-date-grid">
                <div className="al-field">
                  <label htmlFor="startDate">
                    <HiOutlineCalendarDays size={15} /> Start Date *
                  </label>
                  <input
                    type="date" id="startDate" name="startDate"
                    min={today} value={formData.startDate}
                    onChange={handleChange} required
                  />
                </div>
                <div className="al-field">
                  <label htmlFor="endDate">
                    <HiOutlineCalendarDays size={15} /> End Date *
                  </label>
                  <input
                    type="date" id="endDate" name="endDate"
                    min={formData.startDate || today}
                    value={formData.endDate}
                    onChange={handleChange} required
                  />
                </div>
              </div>

              {/* Days Preview */}
              {totalDays() > 0 && (
                <div className="al-days-preview">
                  <HiOutlineClock size={16} />
                  <span>Duration: <strong>{totalDays()} day{totalDays() > 1 ? "s" : ""}</strong></span>
                  <div className="al-days-dots">
                    {Array.from({ length: Math.min(totalDays(), 7) }).map((_, i) => (
                      <div key={i} className="al-dot" />
                    ))}
                    {totalDays() > 7 && <span className="al-dots-more">+{totalDays() - 7}</span>}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="al-field">
                <label htmlFor="reason">
                  <HiOutlineChatBubbleLeftRight size={15} /> Reason *
                </label>
                <textarea
                  id="reason" name="reason" rows={4}
                  placeholder="Please describe the reason for your leave…"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="al-submit-btn" disabled={submitting}>
                {submitting ? (
                  <><div className="al-btn-spin" /> Submitting…</>
                ) : (
                  <><FiSend size={16} /> Submit Application</>
                )}
              </button>
            </form>
          </div>

          {/* ── Leave History ─────────────────────────────────────────────── */}
          <div className="al-history-panel">
            <div className="al-history-header">
              <div className="al-form-icon">
                <BsClipboardCheck size={17} color="#f16363" />
              </div>
              <div>
                <h2>Leave History</h2>
                <p>{leaves.length} total application{leaves.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            <div className="al-history-list">
              {loading ? (
                <div className="al-loader">
                  <div className="al-loader-ring" />
                  <p>Loading…</p>
                </div>
              ) : leaves.length === 0 ? (
                <div className="al-empty">
                  <MdOutlineHourglassEmpty size={40} color="#cbd5e1" />
                  <p>No applications yet</p>
                  <span>Your leave history will appear here</span>
                </div>
              ) : (
                leaves.map((l) => <HistoryCard key={l._id} leave={l} />)
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ApplyLeave;