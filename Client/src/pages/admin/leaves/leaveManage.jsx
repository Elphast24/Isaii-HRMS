import { useState, useEffect } from "react";
import Sidebar from "../../../component/Sidebar/sidebar";
import {
  getAllLeavesAPI,
  approveLeaveAPI,
  rejectLeaveAPI,
} from "../../../service/api";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  HiOutlineClipboardDocumentList,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineFunnel,
  HiOutlineArrowPath,
  HiOutlineChatBubbleLeftRight,
  HiOutlineHeart,
  HiOutlineSun,
  HiGlobeEuropeAfrica,
  HiOutlineUserGroup,
  HiOutlineBanknotes,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import {
  MdOutlinePendingActions,
  MdOutlineCheckCircle,
  MdOutlineCancel,
  MdOutlineHourglassEmpty,
} from "react-icons/md";
import { BsCheckCircleFill, BsXCircleFill, BsInbox } from "react-icons/bs";

import "./leaveManage.css";

// ── Configs ───────────────────────────────────────────────────────────────────
const typeConfig = {
  sick:      { color: "#ef4444", bg: "#fef2f2", label: "Sick Leave",      icon: HiOutlineHeart },
  casual:    { color: "#3b82f6", bg: "#eff6ff", label: "Casual Leave",    icon: HiOutlineSun },
  annual:    { color: "#10b981", bg: "#ecfdf5", label: "Annual Leave",    icon: HiGlobeEuropeAfrica },
  maternity: { color: "#f59e0b", bg: "#fffbeb", label: "Maternity Leave", icon: HiOutlineUserGroup },
  unpaid:    { color: "#64748b", bg: "#f8fafc", label: "Unpaid Leave",    icon: HiOutlineBanknotes },
};

const statusConfig = {
  pending:  { color: "#d97706", bg: "#fef3c7", label: "Pending",  icon: MdOutlinePendingActions },
  approved: { color: "#059669", bg: "#d1fae5", label: "Approved", icon: MdOutlineCheckCircle },
  rejected: { color: "#dc2626", bg: "#fee2e2", label: "Rejected", icon: MdOutlineCancel },
};

// ── Sub-Components ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, gradient, lightBg, textColor }) => (
  <div className="lm-stat-card">
    <div className="lm-stat-icon" style={{ background: lightBg }}>
      <Icon size={22} color={textColor} />
    </div>
    <div className="lm-stat-body">
      <h3 className="lm-stat-value" style={{ color: textColor }}>{value}</h3>
      <p className="lm-stat-label">{label}</p>
    </div>
    <div className="lm-stat-glow" style={{ background: gradient }} />
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className="lm-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={14} />
      {cfg.label}
    </span>
  );
};

const LeaveTypePill = ({ type }) => {
  const cfg = typeConfig[type] || typeConfig.casual;
  const Icon = cfg.icon;
  return (
    <span className="lm-type-pill" style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={14} />
      {cfg.label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const LeaveManagement = () => {
  const [leaves, setLeaves]               = useState([]);
  const [summary, setSummary]             = useState({});
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [filterStatus, setFilterStatus]   = useState("");
  const [searchTerm, setSearchTerm]       = useState("");
  const [notification, setNotification]   = useState(null);
  const [rejectModal, setRejectModal]     = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing]       = useState(null);

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchLeaves = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const res    = await getAllLeavesAPI(params);
      setLeaves(res.data.leaves || []);
      setSummary(res.data.summary || {});
    } catch {
      notify("Failed to fetch leave requests", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [filterStatus]);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await approveLeaveAPI(id);
      notify("Leave approved successfully");
      fetchLeaves();
    } catch {
      notify("Failed to approve leave", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessing(rejectModal._id);
    try {
      await rejectLeaveAPI(rejectModal._id, { rejectionReason });
      notify("Leave rejected");
      setRejectModal(null);
      setRejectionReason("");
      fetchLeaves();
    } catch {
      notify("Failed to reject leave", "error");
    } finally {
      setProcessing(null);
    }
  };

  // Client-side search filter
  const filteredLeaves = leaves.filter(l => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.employee?.name?.toLowerCase().includes(q) ||
      l.employee?.department?.toLowerCase().includes(q) ||
      l.leaveType?.toLowerCase().includes(q)
    );
  });

  const statCards = [
    { label: "Pending",  value: summary.pending || 0, icon: MdOutlinePendingActions, gradient: "linear-gradient(135deg,#f59e0b,#d97706)", lightBg: "#fef3c7", textColor: "#d97706" },
    { label: "Approved", value: summary.approved || 0, icon: MdOutlineCheckCircle, gradient: "linear-gradient(135deg,#10b981,#059669)", lightBg: "#d1fae5", textColor: "#059669" },
    { label: "Rejected", value: summary.rejected || 0, icon: MdOutlineCancel, gradient: "linear-gradient(135deg,#ef4444,#dc2626)", lightBg: "#fee2e2", textColor: "#dc2626" },
    { label: "Total Requests", value: summary.total || 0, icon: HiOutlineClipboardDocumentList, gradient: "linear-gradient(135deg,#f16363,#4f46e5)", lightBg: "#e0e7ff", textColor: "#4f46e5" },
  ];

  return (
    <div className="lm-layout">
      <Sidebar />
      <main className="lm-main">

        {/* Notification */}
        {notification && (
          <div className={`lm-notification ${notification.type}`}>
            {notification.type === "success" ? <BsCheckCircleFill size={16} /> : <BsXCircleFill size={16} />}
            {notification.message}
          </div>
        )}

        {/* Top Bar */}
        <div className="lm-topbar">
          <div className="lm-header-left">
            <div className="lm-title-icon">
              <HiOutlineClipboardDocumentList size={28} color="#f16363" />
            </div>
            <div>
              <h1>Leave Management</h1>
              <p>Review and manage employee leave requests</p>
            </div>
          </div>
          <button
            className={`lm-refresh-btn ${refreshing ? "spinning" : ""}`}
            onClick={() => fetchLeaves(true)}
            disabled={refreshing}
          >
            <HiOutlineArrowPath size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="lm-stats-grid">
          {statCards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>

        {/* Filters */}
        <div className="lm-filters-card">
          <div className="lm-filters-left">
            <div className="lm-search-box">
              <HiOutlineMagnifyingGlass size={17} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by name, department, or type…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="lm-search-input"
              />
              {searchTerm && (
                <button className="lm-clear-btn" onClick={() => setSearchTerm("")}>×</button>
              )}
            </div>
          </div>
          <div className="lm-filters-right">
            <div className="lm-select-wrap">
              <HiOutlineFunnel size={16} color="#94a3b8" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="lm-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="lm-results-count">
              {filteredLeaves.length} request{filteredLeaves.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="lm-loader">
            <div className="lm-loader-ring" />
            <p>Loading leave requests…</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="lm-empty">
            <div className="lm-empty-icon"><BsInbox size={48} color="#cbd5e1" /></div>
            <h3>No leave requests found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="lm-cards-grid">
            {filteredLeaves.map((leave) => (
              <div key={leave._id} className="lm-card">
                
                {/* Card Header */}
                <div className="lm-card-header">
                  <div className="lm-emp-info">
                    <div className="lm-avatar">
                      {leave.employee?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="lm-emp-name">{leave.employee?.name}</p>
                      <p className="lm-emp-dept">{leave.employee?.department || "No Department"}</p>
                    </div>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>

                {/* Card Body */}
                <div className="lm-card-body">
                  <LeaveTypePill type={leave.leaveType} />
                  
                  <div className="lm-details-row">
                    <div className="lm-detail-item">
                      <HiOutlineCalendarDays size={15} color="#64748b" />
                      <span>
                        {new Date(leave.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} 
                        {" → "}
                        {new Date(leave.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="lm-detail-item">
                      <HiOutlineClock size={15} color="#64748b" />
                      <span>{leave.totalDays} day{leave.totalDays > 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <div className="lm-reason-box">
                    <HiOutlineChatBubbleLeftRight size={14} color="#94a3b8" className="lm-reason-icon" />
                    <p className="lm-reason-text">{leave.reason}</p>
                  </div>

                  {leave.status === "rejected" && leave.rejectionReason && (
                    <div className="lm-rejection-alert">
                      <HiOutlineExclamationTriangle size={16} />
                      <span>{leave.rejectionReason}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                {leave.status === "pending" && (
                  <div className="lm-card-actions">
                    <button
                      className="lm-btn-approve"
                      disabled={processing === leave._id}
                      onClick={() => handleApprove(leave._id)}
                    >
                      {processing === leave._id ? (
                        <div className="lm-btn-spinner" />
                      ) : (
                        <><HiOutlineCheck size={16} /> Approve</>
                      )}
                    </button>
                    <button
                      className="lm-btn-reject"
                      disabled={processing === leave._id}
                      onClick={() => { setRejectModal(leave); setRejectionReason(""); }}
                    >
                      <HiOutlineXMark size={16} /> Reject
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal && (
          <div className="lm-modal-overlay" onClick={() => setRejectModal(null)}>
            <div className="lm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lm-modal-header">
                <div className="lm-modal-icon-wrap">
                  <HiOutlineExclamationTriangle size={24} color="#dc2626" />
                </div>
                <h3>Reject Leave Request</h3>
                <p>You are rejecting leave for <strong>{rejectModal.employee?.name}</strong></p>
              </div>
              
              <div className="lm-modal-body">
                <label htmlFor="reject-reason">Reason for rejection (optional)</label>
                <textarea
                  id="reject-reason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Insufficient team coverage during this period…"
                  className="lm-textarea"
                />
              </div>

              <div className="lm-modal-footer">
                <button className="lm-btn-secondary" onClick={() => setRejectModal(null)}>
                  Cancel
                </button>
                <button 
                  className="lm-btn-danger" 
                  onClick={handleReject} 
                  disabled={!!processing}
                >
                  {processing === rejectModal._id ? (
                    <><div className="lm-btn-spinner light" /> Rejecting…</>
                  ) : (
                    <><HiOutlineXMark size={16} /> Confirm Reject</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default LeaveManagement;