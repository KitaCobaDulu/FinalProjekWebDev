const prisma = require("../config/prisma");

async function findActiveReports(filters) {
  const { search, type, category, location, page, limit } = filters;
  const where = { status: "ACTIVE" };

  if (search) {
    where.itemName = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (type) {
    where.type = type;
  }

  if (category) {
    where.category = category;
  }

  if (location) {
    where.location = {
      contains: location,
      mode: "insensitive",
    };
  }

  const [data, totalItems] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return { data, totalItems };
}

async function findReportById(id) {
  return prisma.report.findUnique({
    where: { id },
  });
}

async function addReport(data) {
  return prisma.report.create({
    data: {
      type: data.type,
      itemName: data.itemName,
      description: data.description ?? null,
      category: data.category,
      location: data.location,
      date: new Date(data.date),
      reporterName: data.reporterName,
      contactType: data.contactType,
      contactValue: data.contactValue,
    },
  });
}

module.exports = {
  findActiveReports,
  findReportById,
  addReport,
};
