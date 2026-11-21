import { useState, useEffect } from 'react';
import { getReports } from '../services/reportService';
import FilterBar from '../components/FilterBar';
import ReportCard from '../components/ReportCard';

// Nilai awal filter 
const INITIAL_FILTERS = {
  search: '',
  type: '',
  category: '',
  location: '',
  page: 1,
  limit: 6,
};

export default function HomePage() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalItems: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Setiap kali isi 'filters' berubah, ambil ulang data yang sesuai
  useEffect(() => {
    async function loadReports() {
      const response = await getReports(filters);
      if (response.success) {
        setReports(response.data);
        setPagination(response.pagination);
      }
    }
    loadReports();
  }, [filters]);

  // Fungsi saat user mengetik search atau memilih dropdown filter
  const handleFilterChange = (newValues) => {
    setFilters((prev) => ({
      ...prev,
      ...newValues,
      page: 1, // Wajib reset ke halaman 1 setiap kali filter berubah
    }));
  };

  // Fungsi saat tombol Reset diklik
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div>
      <h1>Daftar Barang Hilang & Ditemukan</h1>
      <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
        Menampilkan {reports.length} dari {pagination.totalItems} laporan aktif
      </p>

      {/* Bar Pencarian & Filter */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Daftar Kartu Laporan atau Pesan Kosong */}
      {reports.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            Tidak ada laporan yang cocok.
          </p>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Coba ubah kata kunci pencarian atau klik tombol Reset.
          </p>
        </div>
      ) : (
        <div className="report-grid">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {/* Kontrol Pagination (Muncul jika halaman lebih dari 1) */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={filters.page <= 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
          >
            &laquo; Sebelumnya
          </button>

          <span>
            Halaman <strong>{pagination.page}</strong> dari{' '}
            <strong>{pagination.totalPages}</strong>
          </span>

          <button
            disabled={filters.page >= pagination.totalPages}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
          >
            Berikutnya &raquo;
          </button>
        </div>
      )}
    </div>
  );
}