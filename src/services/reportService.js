import mockReports from '../data/mockReports.json';

export async function getReports({
  search = '',
  type = '',
  category = '',
  location = '',
  page = 1,
  limit = 10,
} = {}) {
  // 1. Ambil hanya yang statusnya ACTIVE dan urutkan dari yang paling baru
  let filtered = mockReports
    .filter((report) => report.status === 'ACTIVE')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 2. Filter berdasarkan kata kunci nama barang (tidak peduli huruf besar/kecil)
  if (search) {
    filtered = filtered.filter((report) =>
      report.itemName.toLowerCase().includes(search.toLowerCase())
    );
  }

  // 3. Filter berdasarkan tipe laporan (LOST / FOUND)
  if (type) {
    filtered = filtered.filter((report) => report.type === type);
  }

  // 4. Filter berdasarkan kategori
  if (category) {
    filtered = filtered.filter((report) => report.category === category);
  }

  // 5. Filter berdasarkan lokasi
  if (location) {
    filtered = filtered.filter((report) =>
      report.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // 6. Hitung pembagian halaman (pagination)
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  // 7. Kembalikan format JSON yang identik dengan API Contract
  return {
    success: true,
    data: paginatedData,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
}

// ===== Checkpoint 2:
const USE_MOCK = true; // ubah ke false untuk memakai backend asli
const BASE_URL = 'http://localhost:3000';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getReportById(id) {
  // Kontrak: id harus bilangan bulat positif
  if (!/^[1-9]\d*$/.test(String(id))) {
    return { success: false, message: 'ID laporan tidak valid' };
  }

  if (USE_MOCK) {
    await delay(300);
    const found = mockReports.find((report) => report.id === Number(id));
    if (!found) return { success: false, message: 'Laporan tidak ditemukan' };
    return { success: true, data: found }; // laporan RESOLVED tetap bisa dibuka
  }

  const res = await fetch(`${BASE_URL}/reports/${id}`);
  return res.json(); // backend membalas { success, data } atau { success: false, message }
}

export async function createReport(payload) {
  if (USE_MOCK) {
    await delay(300);
    const newReport = {
      id: Math.max(0, ...mockReports.map((report) => report.id)) + 1,
      type: payload.type,
      itemName: payload.itemName,
      description: payload.description || null,
      category: payload.category,
      location: payload.location,
      date: new Date(payload.date).toISOString(),
      imageUrl: null,
      reporterName: payload.reporterName,
      contactType: payload.contactType,
      contactValue: payload.contactValue,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    mockReports.unshift(newReport); // hanya di memori, hilang saat halaman di-refresh
    return { success: true, data: newReport };
  }

  const res = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}