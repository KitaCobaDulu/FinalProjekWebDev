const express = require("express");
const {
  getReports,
  getReportById,
  createReport,
} = require("../controllers/reportController");
const uploadImage = require("../middleware/uploadImage");

const router = express.Router();

router.get("/", getReports);
router.get("/:id", getReportById);
router.post("/", uploadImage, createReport);

module.exports = router;
