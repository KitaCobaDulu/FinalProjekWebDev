const mockReports = require("../data/mockReports.json");

const reports = [...mockReports];

function getAllReports() {
  return reports;
}

function findReportById(id) {
  return reports.find((item) => item.id === id);
}

module.exports = {
  getAllReports,
  findReportById,
};
