const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// @route   GET /api/employees
// @desc    Get all employees
// @access  Admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { search, department, isActive } = req.query;
    let query = { role: "employee" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const employees = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Admin
router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select("-password");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/employees
// @desc    Add new employee
// @access  Admin
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, department, position, phone, salary } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const employee = await User.create({
      name,
      email,
      password,
      role: "employee",
      department,
      position,
      phone,
      salary,
    });

    res.status(201).json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        phone: employee.phone,
        salary: employee.salary,
        isActive: employee.isActive,
        joinDate: employee.joinDate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Admin
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, department, position, phone, salary, isActive } =
      req.body;

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, department, position, phone, salary, isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (soft delete)
// @access  Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ success: true, message: "Employee deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/employees/stats/summary
// @desc    Get employee statistics
// @access  Admin
router.get("/stats/summary", protect, adminOnly, async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const activeEmployees = await User.countDocuments({
      role: "employee",
      isActive: true,
    });
    const departments = await User.distinct("department", {
      role: "employee",
    });

    res.json({
      success: true,
      stats: { totalEmployees, activeEmployees, totalDepartments: departments.length, departments },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;