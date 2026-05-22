import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerAPI } from "../../service/api";
import { useAuth } from "../../context/AuthContext";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  HiOutlineUser,
  HiEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineBuildingOffice2,
  HiOutlineBriefcase,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
} from "react-icons/hi2";
import {
  BsPersonCheck,
  BsShieldLock,
  BsCheckCircleFill,
  BsXCircleFill,
} from "react-icons/bs";
import { TbBuildingSkyscraper } from "react-icons/tb";
import { FiArrowRight, FiUserPlus } from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";

import "./register.css";

const DEPARTMENTS = [
  "Engineering", "Marketing", "Sales", "HR",
  "Finance", "Operations", "Design", "Customer Support",
];

const INITIAL = {
  name: "", email: "", password: "", confirmPassword: "",
  role: "employee", department: "", position: "", phone: "",
};

// ── Password strength checker ─────────────────────────────────────────────────
const getPasswordStrength = (pwd) => {
  if (!pwd) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { level: 1, label: "Weak",   color: "#ef4444" };
  if (score <= 2) return { level: 2, label: "Fair",   color: "#f59e0b" };
  if (score <= 3) return { level: 3, label: "Good",   color: "#3b82f6" };
  return             { level: 4, label: "Strong", color: "#10b981" };
};

// ── Form Field Component ──────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, required, children }) => (
  <div className="rg-field">
    <label>
      <Icon size={14} />
      {label}
      {required && <span className="rg-required">*</span>}
    </label>
    {children}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Register = () => {
  const [formData, setFormData]         = useState(INITIAL);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [step, setStep]                 = useState(1); // 2-step form
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  // ── Step 1 validation ─────────────────────────────────────────────────────
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Please fill in your name and email.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setStep(2);
  };

  // ── Final submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { confirmPassword, ...submitData } = formData;
      const res = await registerAPI(submitData);
      const { token, user } = res.data;
      login(token, user);
      navigate(user.role === "admin" ? "/admin-dashboard" : "/employee-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(formData.password);
  const passwordsMatch =
    formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <div className="rg-root">

      {/* ── Left Strip ───────────────────────────────────────────────────────── */}
      <div className="rg-left">
        <div className="rg-left-blob rg-blob-1" />
        <div className="rg-left-blob rg-blob-2" />

        {/* Brand */}
        <div className="rg-brand">
          <div className="rg-brand-icon">
            <TbBuildingSkyscraper size={22} color="#fff" />
          </div>
          <span className="rg-brand-name">HRMS</span>
        </div>

        {/* Hero */}
        <div className="rg-left-hero">
          <h2>Join Your Team's <span className="rg-accent">Workspace</span></h2>
          <p>Create your account and get instant access to the HRMS platform.</p>

          {/* Benefits */}
          <div className="rg-benefits">
            {[
              { icon: HiOutlineCheckCircle, text: "Access your attendance records" },
              { icon: HiOutlineCheckCircle, text: "Apply for leave instantly"       },
              { icon: HiOutlineCheckCircle, text: "View your payroll information"   },
              { icon: HiOutlineCheckCircle, text: "Stay updated with HR notices"    },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="rg-benefit-item">
                <Icon size={17} color="#6ee7b7" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="rg-step-indicator">
          <div className={`rg-step ${step >= 1 ? "done" : ""}`}>
            <div className="rg-step-circle">
              {step > 1 ? <BsCheckCircleFill size={14} /> : "1"}
            </div>
            <span>Account Info</span>
          </div>
          <div className={`rg-step-line ${step > 1 ? "done" : ""}`} />
          <div className={`rg-step ${step >= 2 ? "active" : ""}`}>
            <div className="rg-step-circle">2</div>
            <span>Profile Info</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel ──────────────────────────────────────────────────────── */}
      <div className="rg-right">
        <div className="rg-form-wrap">

          {/* Header */}
          <div className="rg-form-header">
            <div className="rg-form-icon">
              <FiUserPlus size={22} color="#f16363" />
            </div>
            <h2>Create Account</h2>
            <p>Step {step} of 2 — {step === 1 ? "Account credentials" : "Profile details"}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="rg-error-alert">
              <HiOutlineExclamationCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1 ─────────────────────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="rg-form">

              {/* Name */}
              <Field label="Full Name" icon={HiOutlineUser} required>
                <div className="rg-input-wrap">
                  <HiOutlineUser size={17} color="#94a3b8" className="rg-input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              </Field>

              {/* Email */}
              <Field label="Email Address" icon={HiEnvelope} required>
                <div className="rg-input-wrap">
                  <HiEnvelope size={17} color="#94a3b8" className="rg-input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </Field>

              {/* Password */}
              <Field label="Password" icon={HiOutlineLockClosed} required>
                <div className="rg-input-wrap">
                  <HiOutlineLockClosed size={17} color="#94a3b8" className="rg-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="rg-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <HiOutlineEyeSlash size={17} />
                      : <HiOutlineEye size={17} />}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="rg-strength">
                    <div className="rg-strength-bars">
                      {[1, 2, 3, 4].map((lvl) => (
                        <div
                          key={lvl}
                          className="rg-strength-bar"
                          style={{
                            background: lvl <= pwStrength.level
                              ? pwStrength.color
                              : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ color: pwStrength.color }}>
                      {pwStrength.label}
                    </span>
                  </div>
                )}
              </Field>

              {/* Confirm Password */}
              <Field label="Confirm Password" icon={HiOutlineLockClosed} required>
                <div className="rg-input-wrap">
                  <HiOutlineLockClosed size={17} color="#94a3b8" className="rg-input-icon" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    style={{
                      borderColor: formData.confirmPassword
                        ? passwordsMatch ? "#10b981" : "#ef4444"
                        : undefined,
                    }}
                  />
                  <button
                    type="button"
                    className="rg-eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm
                      ? <HiOutlineEyeSlash size={17} />
                      : <HiOutlineEye size={17} />}
                  </button>
                  {formData.confirmPassword && (
                    <div className="rg-match-icon">
                      {passwordsMatch
                        ? <HiOutlineCheckCircle size={18} color="#10b981" />
                        : <HiOutlineExclamationCircle size={18} color="#ef4444" />}
                    </div>
                  )}
                </div>
              </Field>

              <button type="submit" className="rg-submit-btn">
                <span>Continue</span>
                <FiArrowRight size={17} />
              </button>

            </form>
          )}

          {/* ── STEP 2 ─────────────────────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="rg-form">

              {/* Role */}
              <Field label="Role" icon={MdOutlineAdminPanelSettings} required>
                <div className="rg-role-toggle">
                  {[
                    { value: "employee", label: "Employee", icon: BsPersonCheck },
                    { value: "admin",    label: "Admin",    icon: HiOutlineShieldCheck },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      className={`rg-role-btn ${formData.role === value ? "active" : ""}`}
                      onClick={() => setFormData((p) => ({ ...p, role: value }))}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Department */}
              <Field label="Department" icon={HiOutlineBuildingOffice2}>
                <div className="rg-input-wrap">
                  <HiOutlineBuildingOffice2 size={17} color="#94a3b8" className="rg-input-icon" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="rg-select"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </Field>

              {/* Position */}
              <Field label="Position" icon={HiOutlineBriefcase}>
                <div className="rg-input-wrap">
                  <HiOutlineBriefcase size={17} color="#94a3b8" className="rg-input-icon" />
                  <input
                    type="text"
                    name="position"
                    placeholder="e.g. Software Engineer"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
              </Field>

              {/* Phone */}
              <Field label="Phone" icon={HiOutlinePhone}>
                <div className="rg-input-wrap">
                  <HiOutlinePhone size={17} color="#94a3b8" className="rg-input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </Field>

              {/* Actions */}
              <div className="rg-step2-actions">
                <button
                  type="button"
                  className="rg-back-btn"
                  onClick={() => { setStep(1); setError(""); }}
                >
                  <HiOutlineArrowLeft size={17} /> Back
                </button>
                <button
                  type="submit"
                  className="rg-submit-btn rg-submit-flex"
                  disabled={loading}
                >
                  {loading ? (
                    <><div className="rg-spinner" /> Creating Account…</>
                  ) : (
                    <><FiUserPlus size={17} /> Create Account</>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* Sign in link */}
          <p className="rg-login-link">
            Already have an account?{" "}
            <Link to="/">
              Sign in <FiArrowRight size={13} />
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Register;