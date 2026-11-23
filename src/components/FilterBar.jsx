export default function FilterBar({ filters, onChange, onReset }) {
  return (
    <div className="filter-bar">
      {/* Input Search Nama Barang */}
      <input
        type="text"
        placeholder="Cari nama barang (misal: tumbler, KTM)..."
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        className="filter-input"
      />

      {/* Dropdown Tipe Laporan (LOST / FOUND) */}
      <select
        value={filters.type}
        onChange={(e) => onChange({ type: e.target.value })}
        className="filter-select"
      >
        <option value="">Semua Tipe</option>
        <option value="LOST">Dicari (LOST)</option>
        <option value="FOUND">Ditemukan (FOUND)</option>
      </select>

      {/*  Dropdown Kategori */}
      <select
        value={filters.category}
        onChange={(e) => onChange({ category: e.target.value })}
        className="filter-select"
      >
        <option value="">Semua Kategori</option>
        <option value="ELECTRONIC">Elektronik</option>
        <option value="DOCUMENT_CARD">Kartu / Dokumen</option>
        <option value="TUMBLER">Tumbler / Botol</option>
        <option value="ACCESSORY">Aksesoris</option>
        <option value="STATIONERY">Alat Tulis</option>
        <option value="OTHER">Lainnya</option>
      </select>

      {/* Input Filter Lokasi */}
      <input
        type="text"
        placeholder="Filter lokasi (misal: A206)..."
        value={filters.location}
        onChange={(e) => onChange({ location: e.target.value })}
        className="filter-input"
      />

      {/* Tombol Reset */}
      <button type="button" onClick={onReset} className="btn-reset">
        Reset
      </button>
    </div>
  );
}