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