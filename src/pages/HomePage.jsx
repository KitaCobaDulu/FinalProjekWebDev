import { useState, useEffect } from 'react';
import { getReports } from '../services/reportService';
import FilterBar from '../components/FilterBar';
import ReportCard from '../components/ReportCard';

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

  // State baru untuk Checkpoint 3: Loading dan Error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true); // Mulai loading sebelum request dikirim
      setError(null);     // Bersihkan pesan error sebelumnya

      try {
        const response = await getReports(filters);
        if (response.success) {
          setReports(response.data);
          setPagination(response.pagination);
        } else {
          setError(response.message || 'Terjadi kesalahan saat mengambil data.');
        }
      } catch (err) {
        console.error('Error fetch reports:', err);
        setError('Tidak dapat terhubung ke server. Pastikan server Backend aktif atau coba beberapa saat lagi.');
      } finally {
        setIsLoading(false); // Hentikan loading baik berhasil maupun gagal
      }
    }

    loadReports();
  }, [filters]);

  const handleFilterChange = (newValues) => {
    setFilters((prev) => ({
      ...prev,
      ...newValues,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Fungsi untuk mencoba mengambil data ulang saat terjadi error
  const handleRetry = () => {
    setFilters((prev) => ({ ...prev }));
  };

  return (
    <div>
      <h1>Daftar Barang Hilang & Ditemukan</h1>
      {!isLoading && !error && (
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
          Menampilkan {reports.length} dari {pagination.totalItems} laporan aktif
        </p>
      )}

      {/* Bar Pencarian & Filter */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Kondisi 1: Sedang Loading */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#475569' }}>
          <p style={{ fontWeight: '600', fontSize: '1.05rem' }}>
            ⏳ Sedang memuat daftar laporan...
          </p>
        </div>
      ) : error ? (
        /* Kondisi 2: Terjadi Error */
        <div
          style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
          }}
        >
          <p style={{ fontWeight: '600', marginBottom: '0.75rem' }}>{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Coba Lagi
          </button>
        </div>
      ) : reports.length === 0 ? (
        /* Kondisi 3: Berhasil, tapi data kosong */
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
        /* Kondisi 4: Berhasil dan ada data */
        <div className="report-grid">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {/* Kontrol Pagination */}
      {!isLoading && !error && pagination.totalPages > 1 && (
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