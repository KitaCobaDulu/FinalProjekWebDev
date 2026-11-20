const express = require("express");
const {
  getReports,
  getReportById,
  createReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/", getReports);
router.get("/:id", getReportById);
router.post("/", createReport);

module.exports = router;
