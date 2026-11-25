const fs = require("fs");
const path = require("path");
const prisma = require("../src/config/prisma");

async function main() {
  const reportsPath = path.resolve(__dirname, "../src/data/mockReports.json");
  const mockReports = JSON.parse(fs.readFileSync(reportsPath, "utf8"));

  if (!Array.isArray(mockReports)) {
    throw new Error("mockReports.json harus berisi array");
  }

  // Pengaman: seed menghapus semua data, jadi tolak jika tabel sudah terisi
  const existingCount = await prisma.report.count();
  if (existingCount > 0 && !process.argv.includes("--reset")) {
    throw new Error(
      `Tabel Report sudah berisi ${existingCount} data. ` +
        "Jalankan dengan opsi --reset jika yakin ingin menghapusnya.",
    );
  }

  const reports = mockReports.map((report) => ({
    id: report.id,
    type: report.type,
    itemName: report.itemName,
    description: report.description ?? null,
    category: report.category,
    location: report.location,
    date: new Date(report.date),
    imageUrl: report.imageUrl ?? null,
    reporterName: report.reporterName,
    contactType: report.contactType,
    contactValue: report.contactValue,
    status: report.status,
    createdAt: new Date(report.createdAt),
  }));

  await prisma.$transaction([
    prisma.report.deleteMany(),
    prisma.report.createMany({ data: reports }),
  ]);

  // id dimasukkan manual, jadi penghitung otomatis harus disamakan
  // agar laporan baru mendapat id setelah yang terbesar (11, 12, ...)
  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"Report"', 'id'),
      (SELECT MAX(id) FROM "Report")
    )
  `;

  const insertedCount = await prisma.report.count();
  console.log(`Jumlah data yang masuk: ${insertedCount}`);
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());