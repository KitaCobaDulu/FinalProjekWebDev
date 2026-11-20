const mockReports = require("../data/mockReports.json");

const reports = [...mockReports];

function getAllReports() {
  return reports;
}

function findReportById(id) {
  return reports.find((item) => item.id === id);
}

function addReport(data) {
  // TODO 1:
  const newId =
    reports.length > 0 ? Math.max(...reports.map((item) => item.id)) + 1 : 1;

  // TODO 2:
  const newReport = {
    id: newId,
    ...data,
    imageUrl: null,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  // TODO 3:
  reports.push(newReport);

  // TODO 4:
  return newReport;
}

// TODO 5:
module.exports = {
  getAllReports,
  findReportById,
  addReport,
};
