import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createReport } from '../services/reportService';
import { CATEGORY_OPTIONS, CONTACT_OPTIONS, CONTACT_PLACEHOLDERS } from '../constants/categories';
import './CreateReport.css';

const INITIAL_FORM = {
  type: 'LOST',
  itemName: '',
  category: '',
  location: '',
  date: '',
  description: '',
  reporterName: '',
  contactType: 'WHATSAPP',
  contactValue: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sama dengan batas di backend (uploadImage.js)
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Tanggal hari ini menurut jam di laptop pengguna, format YYYY-MM-DD
function getToday() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Aturan validasi mengikuti API Contract bagian 5.4
function validate(form, image) {
  const errors = {};
  const itemName = form.itemName.trim();
  const location = form.location.trim();
  const description = form.description.trim();
  const reporterName = form.reporterName.trim();
  const contactValue = form.contactValue.trim();

  if (itemName.length < 3 || itemName.length > 100) {
    errors.itemName = 'Nama barang harus 3 sampai 100 karakter';
  }
  if (!form.category) errors.category = 'Pilih kategori';
  if (location.length < 2 || location.length > 100) {
    errors.location = 'Lokasi harus 2 sampai 100 karakter';
  }
  if (!form.date) errors.date = 'Tanggal wajib diisi';
  else if (form.date > getToday()) errors.date = 'Tanggal tidak boleh di masa depan';

  // Checkpoint 3: foto opsional, tapi deskripsi atau foto minimal salah satu
  if (!description && !image) {
    errors.description = 'Isi deskripsi atau unggah foto (minimal salah satu)';
  } else if (description.length > 500) {
    errors.description = 'Deskripsi maksimal 500 karakter';
  }

  if (image) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      errors.image = 'Format foto harus JPEG, PNG, atau WebP';
    } else if (image.size > MAX_IMAGE_SIZE) {
      errors.image = 'Ukuran foto maksimal 2 MB';
    }
  }

  if (reporterName.length < 2 || reporterName.length > 100) {
    errors.reporterName = 'Nama pelapor harus 2 sampai 100 karakter';
  }
  if (!contactValue) errors.contactValue = 'Kontak wajib diisi';
  else if (contactValue.length > 100) errors.contactValue = 'Kontak maksimal 100 karakter';
  else if (form.contactType === 'EMAIL' && !EMAIL_PATTERN.test(contactValue)) {
    errors.contactValue = 'Format email tidak valid';
  }
  return errors;
}

// Komponen kecil untuk label + kolom + pesan error (ditaruh di luar CreateReport)
function Field({ label, error, children }) {
  return (
    <label className="cr-field">
      {label}
      {children}
      {error && <span className="cr-error">{error}</span>}
    </label>
  );
}

export default function CreateReport() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Bersihkan URL pratinjau supaya tidak bocor memori
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // kalau jenis kontak diganti, kosongkan isi kontak lama supaya tidak salah format
      ...(name === 'contactType' ? { contactValue: '' } : {}),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0] || null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : '');
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const foundErrors = validate(form, image);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    // Kirim sebagai multipart/form-data (id, status, createdAt, imageUrl diisi server)
    const formData = new FormData();
    formData.append('type', form.type);
    formData.append('itemName', form.itemName.trim());
    formData.append('description', form.description.trim());
    formData.append('category', form.category);
    formData.append('location', form.location.trim());
    formData.append('date', form.date); // format YYYY-MM-DD
    formData.append('reporterName', form.reporterName.trim());
    formData.append('contactType', form.contactType);
    formData.append('contactValue', form.contactValue.trim());
    if (image) formData.append('image', image); // nama field sesuai backend

    setSubmitting(true);
    setServerError('');
    try {
      const response = await createReport(formData);
      if (response.success) {
        navigate(`/reports/${response.data.id}`);
      } else {
        // Error validasi dari server: { errors: [{ field, message }] }
        if (Array.isArray(response.errors)) {
          const fieldErrors = {};
          response.errors.forEach((err) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        }
        setServerError(response.message || 'Gagal mengirim laporan');
      }
    } catch {
      setServerError('Gagal terhubung ke server, coba lagi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cr-container">
      <Link to="/">← Kembali ke daftar</Link>
      <h1 className="cr-title">Buat Laporan</h1>

      <form className="cr-form" onSubmit={handleSubmit} noValidate>
        <div className="cr-row">
          <Field label="Jenis laporan">
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="LOST">Dicari (LOST)</option>
              <option value="FOUND">Ditemukan (FOUND)</option>
            </select>
          </Field>

          <Field label="Kategori" error={errors.category}>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">-- Pilih kategori --</option>
              {CATEGORY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Nama barang" error={errors.itemName}>
          <input name="itemName" maxLength={100} value={form.itemName} onChange={handleChange} placeholder="misal: Tumbler biru" />
        </Field>

        <div className="cr-row">
          <Field label="Lokasi" error={errors.location}>
            <input name="location" maxLength={100} value={form.location} onChange={handleChange} placeholder="misal: Ruang A206" />
          </Field>

          <Field label="Tanggal" error={errors.date}>
            <input type="date" name="date" value={form.date} max={getToday()} onChange={handleChange} />
          </Field>
        </div>

        <Field label="Deskripsi" error={errors.description}>
          <textarea
            name="description"
            rows="4"
            maxLength={500}
            value={form.description}
            onChange={handleChange}
            placeholder="Ciri-ciri barang (maksimal 500 karakter)"
          />
        </Field>

        <Field label="Foto (opsional, maks 2 MB)" error={errors.image}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={submitting}
          />
          {preview && (
            <img
              src={preview}
              alt="Pratinjau foto"
              style={{ maxWidth: '100%', maxHeight: 200, marginTop: 8, objectFit: 'contain' }}
            />
          )}
        </Field>

        <div className="cr-row">
          <Field label="Nama pelapor" error={errors.reporterName}>
            <input name="reporterName" maxLength={100} value={form.reporterName} onChange={handleChange} />
          </Field>

          <Field label="Jenis kontak">
            <select name="contactType" value={form.contactType} onChange={handleChange}>
              {CONTACT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Kontak" error={errors.contactValue}>
          <input
            name="contactValue"
            maxLength={100}
            value={form.contactValue}
            onChange={handleChange}
            placeholder={CONTACT_PLACEHOLDERS[form.contactType]}
          />
        </Field>

        {serverError && <p className="cr-error">{serverError}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? (image ? 'Mengunggah foto...' : 'Mengirim...') : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  );
}