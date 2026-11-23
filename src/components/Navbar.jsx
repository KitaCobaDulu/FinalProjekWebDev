import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #ddd' }}>
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none' }}>
        FoundIT
      </Link>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/">Beranda</Link>
        <Link to="/reports/new">Buat Laporan</Link>
      </div>
    </nav>
  );
}