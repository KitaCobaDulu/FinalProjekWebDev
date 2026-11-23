import { Link } from 'react-router-dom';

// Mapping label
const CATEGORY_LABELS = {
  ELECTRONIC: 'Elektronik',
  DOCUMENT_CARD: 'Kartu / Dokumen',
  TUMBLER: 'Tumbler / Botol',
  ACCESSORY: 'Aksesoris',
  STATIONERY: 'Alat Tulis',
  OTHER: 'Lainnya',
};

export default function ReportCard({ report }) {
  // Format tanggal ISO
  const formattedDate = new Date(report.date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isLost = report.type === 'LOST';

  return (
    <div className="report-card">
      {/* Tampilkan foto HANYA jika imageUrl tidak null */}
      {report.imageUrl && (
        <img
          src={report.imageUrl}
          alt={report.itemName}
          className="report-card-img"
        />
      )}

      <div className="report-card-body">
        {/* Badge LOST atau FOUND & Kategori */}
        <div className="report-card-badges">
          <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
            {isLost ? 'DICARI (LOST)' : 'DITEMUKAN (FOUND)'}
          </span>
          <span className="badge badge-category">
            {CATEGORY_LABELS[report.category] || report.category}
          </span>
        </div>

        {/* Nama Barang */}
        <h3 className="report-card-title">{report.itemName}</h3>

        {/* Lokasi & Tanggal */}
        <p className="report-card-meta">📍 {report.location}</p>
        <p className="report-card-meta">📅 {formattedDate}</p>

        {/* Tombol menuju halaman Detail Laporan (/reports/:id) */}
        <Link to={`/reports/${report.id}`} className="btn-detail">
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}