import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <h1>404 - Halaman Tidak Ditemukan</h1>
      <p>Maaf, halaman yang kamu cari tidak ada.</p>
      <Link to="/">Kembali ke Beranda</Link>
    </div>
  );
}