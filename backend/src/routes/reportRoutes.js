const express = require("express");
const {
  getReports,
  getReportById
} = require("../controllers/reportController");


const router = express.Router();


router.get("/", getReports);
router.get("/:id", getReportById);


module.exports = router;