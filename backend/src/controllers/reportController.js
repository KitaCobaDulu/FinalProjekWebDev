const { REPORT_TYPES, CATEGORIES, MAX_LIMIT, MAX_REPORT_ID } = require("../constants");

const {
  findActiveReports,
  findReportById,
  addReport,
} = require("../store/reportStore");

const { validateReportInput } = require("../validators/reportValidator");

function toTrimmedText(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function getReports(req, res) {
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

  const { data, totalItems } = await findActiveReports({
    search: toTrimmedText(search),
    type,
    category,
    location: toTrimmedText(location),
    page,
    limit,
  });

  const totalPages = Math.ceil(totalItems / limit);

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

async function getReportById(req, res) {
  const idParam = req.params.id;
  const id = Number(idParam);

  if (!/^[1-9]\d*$/.test(idParam) || !Number.isSafeInteger(id)) {
    return res.status(400).json({
      success: false,
      message: "ID laporan tidak valid",
    });
  }

  // Angka sebesar ini pasti tidak ada di database (kolom id bertipe Int)
  if (id > MAX_REPORT_ID) {
    return res.status(404).json({
      success: false,
      message: "Laporan tidak ditemukan",
    });
  }

  const report = await findReportById(id);

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

async function createReport(req, res) {
  const { errors, data } = validateReportInput(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors,
    });
  }

  const newReport = await addReport(data);

  res.status(201).json({
    success: true,
    data: newReport,
  });
}

module.exports = {
  getReports,
  getReportById,
  createReport,
};
