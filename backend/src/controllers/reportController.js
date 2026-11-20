const {
    REPORT_TYPES,
    CATEGORIES,
    MAX_LIMIT
} = require("../constants");


const {
    getAllReports,
    findReportById
} = require("../store/reportStore");


function toSearchText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}


function getReports(req, res) {
  const { search, type, category, location } = req.query;
  const page = Number(req.query.page || 1);
  const requestedLimit = Number(req.query.limit || 10);

  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({
      success: false,
      message: "Parameter page harus bilangan bulat positif",
    });
  }

  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    return res.status(400).json({
      success: false,
      message: "Parameter limit harus bilangan bulat positif",
    });
  }


  const limit = Math.min(requestedLimit, MAX_LIMIT);

  if (type && !REPORT_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Parameter type harus LOST atau FOUND",
    });
  }

  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Parameter category tidak valid",
    });
  }


  let filteredReports = getAllReports().filter((report) => report.status === "ACTIVE");

  const searchText = toSearchText(search);
  if (searchText) {
    filteredReports = filteredReports.filter((report) =>
      report.itemName.toLowerCase().includes(searchText),
    );
  }

  if (type) {
    filteredReports = filteredReports.filter((report) => report.type === type);
  }

  if (category) {
    filteredReports = filteredReports.filter(
      (report) => report.category === category,
    );
  }

  const locationText = toSearchText(location);
  if (locationText) {
    filteredReports = filteredReports.filter((report) =>
      report.location.toLowerCase().includes(locationText),
    );
  }

  filteredReports.sort(
    (firstReport, secondReport) =>
      new Date(secondReport.createdAt) - new Date(firstReport.createdAt),
  );

  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const data = filteredReports.slice(startIndex, startIndex + limit);

  res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  });
}

function getReportById(req, res) {
  const idParam = req.params.id;
  const id = Number(idParam);


  if (!/^[1-9]\d*$/.test(idParam) || !Number.isSafeInteger(id)) {
    return res.status(400).json({
      success: false,
      message: "ID laporan tidak valid",
    });
  }

  const report = findReportById(id);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: "Laporan tidak ditemukan",
    });
  }

  res.json({
    success: true,
    data: report,
  });
}

module.exports = {
    getReports,
    getReportById
};