import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getReportById } from '../services/reportService';
import { CATEGORY_LABELS, CONTACT_LABELS } from '../constants/categories';
import noImage from '../assets/no-image.svg';
import './ReportDetail.css';

// Membuat link yang bisa diklik sesuai jenis kontak
function getContactLink(type, value) {
  if (type === 'EMAIL') return `mailto:${value}`;
  if (type === 'WHATSAPP') {
    const digits = value.replace(/\D/g, '');
    const international = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
    return `https://wa.me/${international}`;
  }
  if (type === 'INSTAGRAM') return `https://instagram.com/${value.replace('@', '')}`;
  return null; // LINE tidak punya link langsung
}

export default function ReportDetail() {
  const { id } = useParams(); // mengambil angka :id dari URL
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadReport() {
      setLoading(true);
      setError('');
      try {
        const response = await getReportById(id);
        if (ignore) return;
        if (response.success) {
          setReport(response.data);
        } else {
          setError(response.message || 'Laporan tidak ditemukan');
        }
      } catch {
        if (!ignore) setError('Gagal mengambil data laporan');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadReport();
    return () => { ignore = true; };
  }, [id]);

  if (loading) return <p className="rd-status">Memuat laporan...</p>;

  if (error) {
    return (
      <div className="rd-status">
        <p>{error}</p>
        <Link to="/">Kembali ke Beranda</Link>
      </div>
    );
  }

  const isLost = report.type === 'LOST';
  const isResolved = report.status === 'RESOLVED';

  // Server mengirim waktu UTC, jadi ditampilkan dalam zona waktu lokal pengguna
  const formattedDate = new Date(report.date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const formattedCreatedAt = new Date(report.createdAt).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const contactLink = getContactLink(report.contactType, report.contactValue);

  return (
    <main className="rd-container">
      <Link to="/" className="rd-back">← Kembali ke daftar</Link>

      <img
        className="rd-img"
        src={report.imageUrl || noImage}
        alt={report.imageUrl ? report.itemName : 'Tidak ada foto'}
      />

      <div className="rd-badges">
        <span className={`rd-badge ${isLost ? 'rd-badge--lost' : 'rd-badge--found'}`}>
          {isLost ? 'DICARI (LOST)' : 'DITEMUKAN (FOUND)'}
        </span>
        <span className="rd-badge rd-badge--category">
          {CATEGORY_LABELS[report.category] || report.category}
        </span>
        {isResolved && <span className="rd-badge rd-badge--resolved">SELESAI</span>}
      </div>

      <h1 className="rd-title">{report.itemName}</h1>

      <dl className="rd-info">
        <div><dt>Lokasi</dt><dd>{report.location}</dd></div>
        <div><dt>Tanggal</dt><dd>{formattedDate}</dd></div>
        <div><dt>Pelapor</dt><dd>{report.reporterName}</dd></div>
        <div>
          <dt>Kontak ({CONTACT_LABELS[report.contactType] || report.contactType})</dt>
          <dd>
            {contactLink ? (
              <a href={contactLink} target="_blank" rel="noreferrer">{report.contactValue}</a>
            ) : (
              report.contactValue
            )}
          </dd>
        </div>
        <div><dt>Dilaporkan pada</dt><dd>{formattedCreatedAt}</dd></div>
      </dl>

      {/* Kontrak: kalau description null, bagian ini disembunyikan */}
      {report.description && (
        <>
          <h2 className="rd-subtitle">Deskripsi</h2>
          <p className="rd-desc">{report.description}</p>
        </>
      )}
    </main>
  );
}