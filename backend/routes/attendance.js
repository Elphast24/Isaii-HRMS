const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const { protect, adminOnly } = require("../middleware/auth");

// @route   POST /api/attendance/mark
// @desc    Mark attendance (check-in)
// @access  Employee
router.post("/mark", protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (existingAttendance) {
      // If already checked in, do check-out
      if (!existingAttendance.checkOut) {
        const checkOutTime = new Date();
        const workHours =
          (checkOutTime - existingAttendance.checkIn) / (1000 * 60 * 60);

        existingAttendance.checkOut = checkOutTime;
        existingAttendance.workHours = parseFloat(workHours.toFixed(2));

        if (workHours < 4) {
          existingAttendance.status = "half-day";
        } else {
          existingAttendance.status = "present";
        }

        await existingAttendance.save();
        return res.json({
          success: true,
          message: "Checked out successfully",
          attendance: existingAttendance,
        });
      }
      return res
        .status(400)
        .json({ message: "Attendance already marked for today" });
    }

    // Check-in
    const checkInTime = new Date();
    const workStartHour = 9;
    const isLate = checkInTime.getHours() > workStartHour;

    const attendance = await Attendance.create({
      employee: req.user._id,
      date: today,
      checkIn: checkInTime,
      status: isLate ? "late" : "present",
      notes: req.body.notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/attendance/my-attendance
// @desc    Get current employee's attendance
// @access  Employee
router.get("/my-attendance", protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { employee: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate("employee", "name email department");

    // Today's attendance status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    res.json({
      success: true,
      todayAttendance,
      attendance,
      total: attendance.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/attendance/all
// @desc    Get all employees attendance (Admin)
// @access  Admin
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const { date, employeeId, month, year } = req.query;
    let query = {};

    if (employeeId) query.employee = employeeId;

    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: selectedDate, $lt: nextDay };
    } else if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate("employee", "name email department position")
      .sort({ date: -1 });

    // Summary stats
    const presentCount = attendance.filter(
      (a) => a.status === "present"
    ).length;
    const absentCount = attendance.filter((a) => a.status === "absent").length;
    const lateCount = attendance.filter((a) => a.status === "late").length;
    const halfDayCount = attendance.filter(
      (a) => a.status === "half-day"
    ).length;

    res.json({
      success: true,
      count: attendance.length,
      summary: { presentCount, absentCount, lateCount, halfDayCount },
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/attendance/today-summary
// @desc    Get today's attendance summary
// @access  Admin
router.get("/today-summary", protect, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
    }).populate("employee", "name department");

    const presentCount = todayAttendance.filter(
      (a) => a.status === "present" || a.status === "late"
    ).length;

    res.json({
      success: true,
      totalPresent: presentCount,
      attendance: todayAttendance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;