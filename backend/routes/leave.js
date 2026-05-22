const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
const { protect, adminOnly } = require("../middleware/auth");

// Calculate total days between two dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// @route   POST /api/leave/apply
// @desc    Apply for leave
// @access  Employee
router.post("/apply", protect, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    // Check for overlapping leave requests
    const overlapping = await Leave.findOne({
      employee: req.user._id,
      status: { $ne: "rejected" },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (overlapping) {
      return res
        .status(400)
        .json({ message: "You already have a leave request for this period" });
    }

    const totalDays = calculateDays(startDate, endDate);

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays,
      reason,
    });

    await leave.populate("employee", "name email department");

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/leave/my-leaves
// @desc    Get current employee's leave requests
// @access  Employee
router.get("/my-leaves", protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    const pending = leaves.filter((l) => l.status === "pending").length;
    const approved = leaves.filter((l) => l.status === "approved").length;
    const rejected = leaves.filter((l) => l.status === "rejected").length;

    res.json({
      success: true,
      summary: { pending, approved, rejected, total: leaves.length },
      leaves,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/leave/all
// @desc    Get all leave requests (Admin)
// @access  Admin
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (employeeId) query.employee = employeeId;

    const leaves = await Leave.find(query)
      .populate("employee", "name email department position")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    const pending = leaves.filter((l) => l.status === "pending").length;
    const approved = leaves.filter((l) => l.status === "approved").length;
    const rejected = leaves.filter((l) => l.status === "rejected").length;

    res.json({
      success: true,
      summary: { pending, approved, rejected, total: leaves.length },
      leaves,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/leave/:id/approve
// @desc    Approve leave request
// @access  Admin
router.put("/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: "approved", approvedBy: req.user._id },
      { new: true }
    )
      .populate("employee", "name email department")
      .populate("approvedBy", "name");

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({
      success: true,
      message: "Leave approved successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/leave/:id/reject
// @desc    Reject leave request
// @access  Admin
router.put("/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        approvedBy: req.user._id,
        rejectionReason: rejectionReason || "Not specified",
      },
      { new: true }
    )
      .populate("employee", "name email department")
      .populate("approvedBy", "name");

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({
      success: true,
      message: "Leave rejected successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;