import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginAPI } from "../../service/api";
import { useAuth } from "../../context/AuthContext";

// ── React Icons ───────────────────────────────────────────────────────────────
import {
  HiEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineBuildingOffice2,
  HiOutlineShieldCheck,
  HiOutlineArrowRightOnRectangle,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";
import {
  MdOutlineSpaceDashboard,
  MdOutlinePeople,
  MdOutlineLeaderboard,
} from "react-icons/md";
import { BsPersonCheck, BsShieldLock } from "react-icons/bs";
import { RiLeafLine } from "react-icons/ri";
import { TbBuildingSkyscraper } from "react-icons/tb";
import { FiArrowRight } from "react-icons/fi";

import "./authenticate.css";

// ── Feature list ──────────────────────────────────────────────────────────────
const features = [
  { icon: MdOutlinePeople,       label: "Employee Management",  desc: "Manage your entire workforce"    },
  { icon: BsPersonCheck,         label: "Attendance Tracking",  desc: "Real-time check-in & check-out"  },
  { icon: RiLeafLine,            label: "Leave Management",     desc: "Apply and approve leave requests" },
  { icon: MdOutlineLeaderboard,  label: "Analytics Dashboard",  desc: "Insights and performance metrics" },
];

// ── Main Component ────────────────────────────────────────────────────────────
const Login = () => {
  const [formData, setFormData]       = useState({ email: "", password: "" });
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const { login } = useAuth();
  const navigate  = useNavigate();

  // Auto-cycle feature highlight
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginAPI(formData);
      const { token, user } = res.data;
      login(token, user);
      navigate(user.role === "admin" ? "/admin-dashboard" : "/employee-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-root">

      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <div className="lg-left">

        {/* Background blobs */}
        <div className="lg-blob lg-blob-1" />
        <div className="lg-blob lg-blob-2" />
        <div className="lg-blob lg-blob-3" />

        {/* Brand */}
        <div className="lg-brand">
          <div className="lg-brand-icon">
            <TbBuildingSkyscraper size={24} color="#fff" />
          </div>
          <span className="lg-brand-name">HRMS</span>
        </div>

        {/* Hero Content */}
        <div className="lg-hero">
          <div className="lg-hero-badge">
            <HiOutlineShieldCheck size={14} />
            <span>Trusted by 500+ companies</span>
          </div>

          <h1 className="lg-hero-title">
            Manage Your
            <span className="lg-hero-accent"> Workforce</span>
            <br />Smarter & Faster
          </h1>

          <p className="lg-hero-subtitle">
            All-in-one Human Resource Management System that
            streamlines your HR operations seamlessly.
          </p>

          {/* Feature List */}
          <div className="lg-features">
            {features.map(({ icon: Icon, label, desc }, idx) => (
              <div
                key={label}
                className={`lg-feature-item ${activeFeature === idx ? "active" : ""}`}
              >
                <div className="lg-feature-icon">
                  <Icon size={18} />
                </div>
                <div className="lg-feature-text">
                  <p className="lg-feature-label">{label}</p>
                  <p className="lg-feature-desc">{desc}</p>
                </div>
                {activeFeature === idx && (
                  <div className="lg-feature-dot" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Right Panel ────────────────────────────────────────────────────── */}
      <div className="lg-right">
        <div className="lg-form-wrap">

          {/* Form Header */}
          <div className="lg-form-header">
            <div className="lg-form-icon">
              <BsShieldLock size={24} color="#f16363" />
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to your HRMS account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="lg-error-alert">
              <HiOutlineExclamationCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg-form">

            {/* Email Field */}
            <div className="lg-field">
              <label htmlFor="email">Email Address</label>
              <div className="lg-input-wrap">
                <div className="lg-input-icon">
                  <HiEnvelope size={18} color="#94a3b8" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="lg-field">
              <div className="lg-label-row">
                <label htmlFor="password">Password</label>
              </div>
              <div className="lg-input-wrap">
                <div className="lg-input-icon">
                  <HiOutlineLockClosed size={18} color="#94a3b8" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lg-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword
                    ? <HiOutlineEyeSlash size={18} />
                    : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="lg-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="lg-btn-loading">
                  <span className="lg-spinner" />
                  Signing in…
                </span>
              ) : (
                <span className="lg-btn-content">
                  <HiOutlineArrowRightOnRectangle size={18} />
                  Sign In
                  <FiArrowRight size={16} className="lg-arrow" />
                </span>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="lg-divider">
            <span>or</span>
          </div>

          {/* Register link */}
          <div className="lg-register-wrap">
            <p>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="lg-register-link">
                Create one now <FiArrowRight size={13} />
              </Link>
            </p>
          </div>

          {/* Roles hint */}
          <div className="lg-roles-hint">
            <div className="lg-role-pill admin">
              <HiOutlineShieldCheck size={13} />
              Admin
            </div>
            <div className="lg-role-pill employee">
              <BsPersonCheck size={13} />
              Employee
            </div>
            <span>Role auto-detected on login</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;