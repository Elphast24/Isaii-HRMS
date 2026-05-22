import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../../component/sidebar/sidebar";
import {
  getAllEmployeesAPI,
  addEmployeeAPI,
  updateEmployeeAPI,
  deleteEmployeeAPI,
} from "../../../service/api";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  HiOutlineUser,
  HiEnvelope,
  HiOutlineBriefcase,
  HiOutlinePhone,
  HiOutlineBuildingOffice2,
  HiOutlineCurrencyDollar,
  HiOutlineKey,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";
import { FiArrowRight } from "react-icons/fi";
import { BiSolidBadgeCheck } from "react-icons/bi";

import "./empManage.css";

const DEPARTMENTS = [
  "Engineering", "Marketing", "Sales", "HR",
  "Finance", "Operations", "Design", "Customer Support",
];

const INITIAL_FORM = {
  name: "", email: "", password: "", department: "",
  position: "", phone: "", salary: "", isActive: true,
};

const EmployeeList = () => {
  const [employees, setEmployees]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editMode, setEditMode]           = useState(false);
  const [selectedEmp, setSelectedEmp]     = useState(null);
  const [formData, setFormData]           = useState(INITIAL_FORM);
  const [search, setSearch]               = useState("");
  const [filterDept, setFilterDept]       = useState("");
  const [formError, setFormError]         = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification]   = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)     params.search     = search;
      if (filterDept) params.department = filterDept;

      const res = await getAllEmployeesAPI(params);
      setEmployees(res.data.employees || []);
    } catch (err) {
      showNotification("Failed to fetch employees", "error");
    } finally {
      setLoading(false);
    }
  }, [search, filterDept]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // ── Modal Handlers ────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditMode(false);
    setFormData(INITIAL_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditMode(true);
    setSelectedEmp(emp);
    setFormData({
      name:       emp.name       || "",
      email:      emp.email      || "",
      password:   "",
      department: emp.department || "",
      position:   emp.position   || "",
      phone:      emp.phone      || "",
      salary:     emp.salary     || "",
      isActive:   emp.isActive,
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
  };

  // ── Form Field Change ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      if (editMode) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await updateEmployeeAPI(selectedEmp._id, updateData);
        showNotification("Employee updated successfully");
      } else {
        await addEmployeeAPI(formData);
        showNotification("Employee added successfully");
      }
      closeModal();
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteEmployeeAPI(deleteConfirm._id);
      showNotification("Employee deactivated successfully");
      setDeleteConfirm(null);
      fetchEmployees();
    } catch {
      showNotification("Failed to deactivate employee", "error");
    }
  };

  // ── Status Badge Component ──────────────────────────────────────────────────
  const StatusBadge = ({ active }) => (
    <div className={`status-badge ${active ? "active" : "inactive"}`}>
      {active ? <HiOutlineCheckCircle size={14} /> : <HiOutlineXCircle size={14} />}
      <span>{active ? "Active" : "Inactive"}</span>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="em-layout">
      <Sidebar />
      <main className="em-main">

        {/* Notification Toast */}
        {notification && (
          <div className={`em-notification ${notification.type}`}>
            {notification.type === "success" ? (
              <BiSolidBadgeCheck size={16} />
            ) : (
              <HiOutlineExclamationTriangle size={16} />
            )}
            {notification.message}
          </div>
        )}

        {/* Page Header */}
        <div className="em-header">
          <div className="em-header-left">
            <div className="em-title-icon">
              <HiOutlineUserGroup size={28} color="#f16363" />
            </div>
            <div>
              <h1>Employee Management</h1>
              <p>Manage your organisation&apos;s team members</p>
            </div>
          </div>
          <button className="em-btn-primary" onClick={openAddModal}>
            <HiOutlinePlus size={16} />
            Add Employee
          </button>
        </div>

        {/* Filters Bar */}
        <div className="em-filters-bar">
          <div className="em-search-box">
            <HiMagnifyingGlass size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by name, email, position…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="em-search-input"
            />
            {search && (
              <button
                className="em-clear-search"
                onClick={() => setSearch("")}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="em-filter-group">
            <div className="em-select-wrap">
              <HiOutlineFunnel size={16} color="#94a3b8" />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="em-select"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <button
              className="em-refresh-btn"
              onClick={fetchEmployees}
              disabled={loading}
              title="Refresh list"
            >
              <HiOutlineArrowPath size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="em-table-container">
          {loading ? (
            <div className="em-loader">
              <div className="em-loader-ring" />
              <p>Loading employees…</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="em-empty-state">
              <div className="em-empty-icon">
                <HiOutlineDocumentText size={48} color="#cbd5e1" />
              </div>
              <h3>No employees found</h3>
              <p>Add your first employee to get started</p>
              <button className="em-btn-primary em-empty-action" onClick={openAddModal}>
                <HiOutlinePlus size={16} />
                Add First Employee
              </button>
            </div>
          ) : (
            <table className="em-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Contact</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="em-table-row">
                    <td>
                      <div className="em-employee-cell">
                        <div className="em-avatar">
                          {emp.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="em-emp-info">
                          <p className="em-emp-name">{emp.name}</p>
                          <p className="em-emp-email">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="em-dept-cell">
                        <HiOutlineBuildingOffice2 size={14} color="#64748b" />
                        <span>{emp.department || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="em-position-cell">
                        <HiOutlineBriefcase size={14} color="#64748b" />
                        <span>{emp.position || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="em-contact-cell">
                        <HiOutlinePhone size={14} color="#64748b" />
                        <span>{emp.phone || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="em-salary-cell">
                        <HiOutlineCurrencyDollar size={14} color="#64748b" />
                        <span>
                          {emp.salary
                            ? `$${Number(emp.salary).toLocaleString()}`
                            : "—"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge active={emp.isActive} />
                    </td>
                    <td>
                      <div className="em-actions">
                        <button
                          className="em-action-btn edit"
                          onClick={() => openEditModal(emp)}
                          title="Edit employee"
                        >
                          <HiOutlinePencil size={16} />
                        </button>
                        <button
                          className="em-action-btn delete"
                          onClick={() => setDeleteConfirm(emp)}
                          title="Deactivate employee"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
        {showModal && (
          <div className="em-modal-overlay" onClick={closeModal}>
            <div className="em-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="em-modal-header">
                <div className="em-modal-title">
                  <div className="em-modal-icon">
                    {editMode ? <HiOutlinePencil size={20} /> : <HiOutlinePlus size={20} />}
                  </div>
                  <h3>{editMode ? "Edit Employee" : "Add New Employee"}</h3>
                </div>
                <button className="em-modal-close" onClick={closeModal} aria-label="Close modal">
                  ×
                </button>
              </div>

              {formError && (
                <div className="em-alert em-alert-error">
                  <HiOutlineExclamationTriangle size={18} />
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="em-modal-form">
                <div className="em-form-grid">
                  <div className="em-form-field">
                    <label htmlFor="name">
                      <HiOutlineUser size={16} />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="em-form-field">
                    <label htmlFor="email">
                      <HiEnvelope size={16} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="em-form-grid">
                  <div className="em-form-field">
                    <label htmlFor="password">
                      <HiOutlineKey size={16} />
                      Password {editMode ? "(leave blank to keep)" : "*"}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required={!editMode}
                    />
                  </div>

                  <div className="em-form-field">
                    <label htmlFor="department">
                      <HiOutlineBuildingOffice2 size={16} />
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="em-form-grid">
                  <div className="em-form-field">
                    <label htmlFor="position">
                      <HiOutlineBriefcase size={16} />
                      Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      placeholder="e.g. Software Engineer"
                      value={formData.position}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="em-form-field">
                    <label htmlFor="phone">
                      <HiOutlinePhone size={16} />
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="em-form-grid">
                  <div className="em-form-field">
                    <label htmlFor="salary">
                      <HiOutlineCurrencyDollar size={16} />
                      Salary ($)
                    </label>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      placeholder="50000"
                      value={formData.salary}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>

                  {editMode && (
                    <div className="em-form-field">
                      <label htmlFor="isActive">
                        <HiOutlineClock size={16} />
                        Status
                      </label>
                      <select
                        id="isActive"
                        name="isActive"
                        value={String(formData.isActive)}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: e.target.value === "true",
                          }))
                        }
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="em-modal-footer">
                  <button
                    type="button"
                    className="em-btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="em-btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="em-loading">
                        <div className="em-spinner"></div>
                        {editMode ? "Updating..." : "Adding..."}
                      </span>
                    ) : (
                      <>
                        {editMode ? "Update" : "Add"} Employee
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete Confirm Modal ──────────────────────────────────────────── */}
        {deleteConfirm && (
          <div className="em-modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div
              className="em-modal-content em-modal-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="em-confirm-header">
                <div className="em-warning-icon">
                  <HiOutlineExclamationTriangle size={32} color="#f59e0b" />
                </div>
                <h3>Deactivate Employee?</h3>
              </div>

              <p className="em-confirm-text">
                Are you sure you want to deactivate{" "}
                <strong>{deleteConfirm.name}</strong>? They will lose access to the system.
              </p>

              <div className="em-modal-footer">
                <button
                  className="em-btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="em-btn-danger"
                  onClick={handleDelete}
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeList;