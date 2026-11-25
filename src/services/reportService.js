import mockReports from '../data/mockReports.json';

const USE_MOCK = false;
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ===== BAGIAN FE 1: Daftar Laporan (GET /reports) =====
export async function getReports({
  search = '',
  type = '',
  category = '',
  location = '',
  page = 1,
  limit = 6,
} = {}) {
  if (USE_MOCK) {
    let filtered = mockReports
      .filter((report) => report.status === 'ACTIVE')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (search) {
      filtered = filtered.filter((report) =>
        report.itemName.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (type) filtered = filtered.filter((report) => report.type === type);
    if (category) filtered = filtered.filter((report) => report.category === category);
    if (location) {
      filtered = filtered.filter((report) =>
        report.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginatedData,
      pagination: { page, limit, totalItems, totalPages },
    };
  }

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (type) params.append('type', type);
  if (category) params.append('category', category);
  if (location) params.append('location', location);
  params.append('page', page);
  params.append('limit', limit);

  const response = await fetch(`${BASE_URL}/reports?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Gagal memuat data dari server (Status: ${response.status})`);
  }

  return await response.json();
}

// ===== BAGIAN FE 2: Detail & Buat Laporan =====
export async function getReportById(id) {
  // Kontrak: id harus bilangan bulat positif
  if (!/^[1-9]\d*$/.test(String(id))) {
    return { success: false, message: 'ID laporan tidak valid' };
  }

  if (USE_MOCK) {
    await delay(300);
    const found = mockReports.find((report) => report.id === Number(id));
    if (!found) return { success: false, message: 'Laporan tidak ditemukan' };
    return { success: true, data: found };
  }

  // Backend membalas JSON juga untuk 400/404, jadi body-nya tetap dibaca
  const res = await fetch(`${BASE_URL}/reports/${id}`);
  return res.json();
}

// formData: objek FormData (multipart/form-data), field foto bernama "image"
export async function createReport(formData) {
  if (USE_MOCK) {
    await delay(300);
    const payload = Object.fromEntries(formData.entries());
    const image = formData.get('image');
    const newReport = {
      id: Math.max(0, ...mockReports.map((report) => report.id)) + 1,
      type: payload.type,
      itemName: payload.itemName,
      description: payload.description || null,
      category: payload.category,
      location: payload.location,
      date: new Date(payload.date).toISOString(),
      imageUrl: image instanceof File ? URL.createObjectURL(image) : null,
      reporterName: payload.reporterName,
      contactType: payload.contactType,
      contactValue: payload.contactValue,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    mockReports.unshift(newReport);
    return { success: true, data: newReport };
  }

  // PENTING: jangan set header Content-Type manual.
  // Browser mengisinya sendiri lengkap dengan boundary multipart.
  const res = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}