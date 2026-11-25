<<<<<<< HEAD

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

# If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# FoundIT Website

Website Lost & Found untuk mahasiswa Fasilkom UI. Pemilik barang yang hilang dan penemu barang bisa saling terhubung lewat laporan publik, tanpa bergantung pada chat grup WhatsApp.

> RISTEK Fasilkom UI Open Class Web Development 2026 - Final Project
> **Status: Checkpoint 1 (Project Preparation)**

## Website Live
https://found-it-iota-liart.vercel.app/

---

## 1. Tim

| Nama                     | Role     | Tanggung jawab |
| ------------------------ | -------- | -------------- |
| Joaquin Mulia Rahardjo   | Frontend | ...            |
| Wong Athena              | Frontend | ...            |
| Rifqy Amanullah Hermawan | Backend  | ...            |

## 2. Tech Stack

| Komponen        | Teknologi                             |
| --------------- | ------------------------------------- |
| Frontend        | HTML, CSS, JavaScript, React.js, Vite |
| Backend         | JavaScript, Node.js, Express.js       |
| Database        | PostgreSQL                            |
| ORM             | Prisma ORM                            |
| Image Storage   | Cloudinary                            |
| Version Control | GitHub                                |

## 3. Halaman & Fitur

### Halaman

| Halaman        | Route          | Deskripsi                                               |
| -------------- | -------------- | ------------------------------------------------------- |
| Home / Listing | `/`            | Daftar laporan Lost & Found, search, filter, pagination |
| Detail Laporan | `/reports/:id` | Detail lengkap satu laporan + kontak publik             |
| Buat Laporan   | `/reports/new` | Form laporan Lost / Found + upload foto opsional        |
| Not Found      | `*`            | Halaman 404                                             |

### Fitur

## Fitur
- Daftar laporan dengan pencarian, filter, dan pagination
- Detail laporan dari GET /reports/:id
- Buat laporan (POST /reports) dengan upload foto opsional (maks 2 MB, JPEG/PNG/WebP)
- Validasi di sisi klien, loading state, dan pesan error dari backend

## 4. Screenshot
| Homepage | Detail |
|---|---|
| <img width="959" height="500" alt="Screenshot 2026-11-25 131219" src="https://github.com/user-attachments/assets/38fcde51-c649-4b7b-82ce-f4ba2d2326bd" />
| <img width="959" height="482" alt="Screenshot 2026-11-25 131301" src="https://github.com/user-attachments/assets/94b36f5b-1f59-4cec-8542-424245bb5ce2" /> 
|

| Form Buat Laporan |
|---|
| <img width="959" height="470" alt="Screenshot 2026-11-25 131316" src="https://github.com/user-attachments/assets/bb47a6a2-3d3e-4b6e-ad13-067863afdced" />
|

## 5. Desain Database

### Tabel `Report`

| Field          | Tipe                      | Boleh null | Keterangan                                                                   |
| -------------- | ------------------------- | ---------- | ---------------------------------------------------------------------------- |
| `id`           | Int (auto increment)      | Tidak      | Primary key, dibuat server                                                   |
| `type`         | Enum `LOST`, `FOUND`      | Tidak      | Jenis laporan                                                                |
| `itemName`     | String                    | Tidak      | Nama barang (3-100 karakter)                                                 |
| `description`  | String                    | Ya\*       | Ciri-ciri barang (maks 500 karakter)                                         |
| `category`     | Enum                      | Tidak      | `ELECTRONIC`, `DOCUMENT_CARD`, `TUMBLER`, `ACCESSORY`, `STATIONERY`, `OTHER` |
| `location`     | String                    | Tidak      | Lokasi hilang/ditemukan (2-100 karakter)                                     |
| `date`         | DateTime (UTC)            | Tidak      | Tanggal barang hilang/ditemukan, tidak boleh di masa depan                   |
| `imageUrl`     | String                    | Ya\*       | URL gambar Cloudinary                                                        |
| `reporterName` | String                    | Tidak      | Nama pelapor (2-100 karakter)                                                |
| `contactType`  | Enum                      | Tidak      | `WHATSAPP`, `LINE`, `INSTAGRAM`, `EMAIL`                                     |
| `contactValue` | String                    | Tidak      | Isi kontak sesuai `contactType` (email harus valid)                          |
| `status`       | Enum `ACTIVE`, `RESOLVED` | Tidak      | Default `ACTIVE`                                                             |
| `createdAt`    | DateTime (UTC)            | Tidak      | Otomatis saat dibuat                                                         |

\* `description` dan `imageUrl` tidak boleh `null` bersamaan. Minimal salah satu harus terisi.

### Relasi

Saat ini seluruh data disimpan dalam **satu tabel `Report`**, tanpa relasi antar tabel. Aplikasi tidak memiliki autentikasi/user, dan kategori, metode kontak, serta status dimodelkan sebagai enum. Jika ke depan dibutuhkan, `category` dapat dipisah menjadi tabel sendiri (relasi 1-N ke `Report`).

### Rencana mapping ke Prisma (implementasi di Week 3)

```prisma
enum ReportType {
  LOST
  FOUND
}

enum Category {
  ELECTRONIC
  DOCUMENT_CARD
  TUMBLER
  ACCESSORY
  STATIONERY
  OTHER
}

enum ContactType {
  WHATSAPP
  LINE
  INSTAGRAM
  EMAIL
}

enum ReportStatus {
  ACTIVE
  RESOLVED
}

model Report {
  id           Int          @id @default(autoincrement())
  type         ReportType
  itemName     String
  description  String?
  category     Category
  location     String
  date         DateTime
  imageUrl     String?
  reporterName String
  contactType  ContactType
  contactValue String
  status       ReportStatus @default(ACTIVE)
  createdAt    DateTime     @default(now())
}
```

## 6. REST API Contract

Dokumen lengkap (baku, versi 1.1): **[docs/API_CONTRACT.md](./docs/API_CONTRACT.md)**. Berikut ringkasannya.

- Base URL lokal: `http://localhost:3000`
- Base URL produksi: `https://final-projek-web-dev.vercel.app`
- Format: JSON, kecuali upload foto (`multipart/form-data`)
- Tanpa autentikasi. Tidak ada endpoint `PUT`/`PATCH`/`DELETE`, sehingga publik tidak bisa mengubah atau menghapus laporan.

### Endpoint

| Method | Path           | Fungsi                                      | Sukses | Tersedia sejak                           |
| ------ | -------------- | ------------------------------------------- | ------ | ---------------------------------------- |
| GET    | `/`            | Cek server berjalan                         | 200    | Checkpoint 2                             |
| GET    | `/reports`     | Daftar laporan (search, filter, pagination) | 200    | Checkpoint 2                             |
| GET    | `/reports/:id` | Detail satu laporan                         | 200    | Checkpoint 2                             |
| POST   | `/reports`     | Kirim laporan baru                          | 201    | Checkpoint 2 (teks), Checkpoint 3 (foto) |

### Query parameter `GET /reports`

Semua opsional dan bisa digabung (logika AND).

| Parameter  | Tipe    | Default | Aturan                                                              |
| ---------- | ------- | ------- | ------------------------------------------------------------------- |
| `search`   | string  | -       | Cari pada `itemName`, mengandung kata, tidak peka huruf besar/kecil |
| `type`     | enum    | -       | `LOST` atau `FOUND`                                                 |
| `category` | enum    | -       | Salah satu dari 6 kategori                                          |
| `location` | string  | -       | Mengandung kata, tidak peka huruf besar/kecil                       |
| `page`     | integer | `1`     | Minimum 1                                                           |
| `limit`    | integer | `10`    | Minimum 1, maksimum 50                                              |

### Perilaku pagination

- Hanya laporan berstatus `ACTIVE` yang muncul di daftar; urutan `createdAt` terbaru lebih dulu.
- `totalItems` = jumlah laporan yang cocok filter; `totalPages = ceil(totalItems / limit)`.
- Tidak ada hasil: status 200 dengan `data: []`, `totalItems: 0`, `totalPages: 0`.
- `page` melebihi `totalPages`: status 200 dengan `data: []` (bukan error).

Contoh: `GET /reports?type=LOST&category=TUMBLER&search=biru&page=1&limit=10`

### Format response

Sukses (satu data):

```json
{ "success": true, "data": {} }
```

Sukses (daftar):

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 10, "totalItems": 10, "totalPages": 1 }
}
```

Error:

```json
{ "success": false, "message": "Pesan error dalam bahasa Indonesia" }
```

Error validasi (400 pada `POST /reports`):

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [{ "field": "itemName", "message": "itemName wajib diisi" }]
}
```

### Contoh objek Report

```json
{
  "id": 4,
  "type": "LOST",
  "itemName": "Tumbler biru",
  "description": "Merek Corkcicle, ada stiker kucing di bagian bawah",
  "category": "TUMBLER",
  "location": "Ruang A206",
  "date": "2026-11-10T00:00:00.000Z",
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "reporterName": "Budi",
  "contactType": "WHATSAPP",
  "contactValue": "081200000001",
  "status": "ACTIVE",
  "createdAt": "2026-11-10T08:30:00.000Z"
}
```

### Contoh `POST /reports` (Checkpoint 2, JSON)

```json
{
  "type": "FOUND",
  "itemName": "KTM atas nama Ani",
  "description": "Ditemukan di dekat mesin fotokopi",
  "category": "DOCUMENT_CARD",
  "location": "Stulo Lantai 1",
  "date": "2026-11-12",
  "reporterName": "Citra",
  "contactType": "LINE",
  "contactValue": "citra.line"
}
```

Response `201 Created` berisi objek laporan lengkap. Server mengisi sendiri `id`, `status` (`ACTIVE`), `createdAt`, dan `imageUrl`.

### Status code

| Kode | Arti                  | Dipakai ketika                   |
| ---- | --------------------- | -------------------------------- |
| 200  | OK                    | Pengambilan data berhasil        |
| 201  | Created               | Laporan berhasil dibuat          |
| 400  | Bad Request           | Input atau parameter tidak valid |
| 404  | Not Found             | Laporan atau rute tidak ada      |
| 500  | Internal Server Error | Kesalahan tak terduga di server  |

### Privasi kontak

Response hanya memuat satu pasangan `contactType` + `contactValue`, yaitu kontak yang dipilih pelapor. Tidak ada field kontak lain yang dikirim ke publik.

## 7. Format Pengiriman Laporan & Upload Foto

| Tahap        | Content-Type          | Foto |
| ------------ | --------------------- | ---- |
| Checkpoint 2 | `application/json`    | ...  |
| Checkpoint 3 | `multipart/form-data` | ...  |

Alur upload (Checkpoint 3):

1. Frontend mengirim `FormData`; semua field teks memakai nama yang sama seperti di kontrak, foto pada field `image` (satu file). Tanpa foto, field `image` tidak disertakan.
2. Aturan file: `image/jpeg`, `image/png`, atau `image/webp`; maksimum 2 MB.
3. Backend membaca form dengan `multer`, memvalidasi teks dan file, lalu mengunggah ke **Cloudinary**.
4. URL aman (`https`) disimpan di kolom `imageUrl`; tanpa foto nilainya `null`.
5. Jika `description` kosong, foto wajib diunggah.
6. Jika `imageUrl` bernilai `null`, Frontend menampilkan placeholder default.

## 8. Mock Data

File `mockReports.json` berisi 10 laporan yang mengikuti kontrak API. Backend memakainya sebagai penyimpanan in-memory awal (Checkpoint 2), Frontend memakainya sebagai mock data.

- Lokasi: [...?]
- 5 laporan `LOST` dan 5 laporan `FOUND`
- Seluruh 6 kategori dan 4 metode kontak tercakup
- 4 laporan tanpa foto (`imageUrl: null`) untuk menguji placeholder
- 1 laporan tanpa deskripsi (`description: null`, `imageUrl` terisi)
- 8 laporan `ACTIVE` dan 2 laporan `RESOLVED`

## 9. Rencana Pengerjaan

| Checkpoint                       | Deadline    | Frontend                                                             | Backend                                                                        |
| -------------------------------- | ----------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1: Project Preparation           | 16 Nov 2026 | README, rencana halaman                                              | API contract, mock data, desain DB, rencana Prisma                             |
| 2: Main UI & Working API         | 19 Nov 2026 | Listing, detail, search/filter, form, responsive (pakai mock)        | `GET /reports`, `GET /reports/:id`, `POST /reports` (in-memory), deploy + CORS |
| 3: Full Integration & Deployment | 22 Nov 2026 | Integrasi API, upload foto, validasi, loading/error state, deploy FE | Prisma + PostgreSQL, migrasi, Cloudinary, validasi, deploy BE                  |

## 10. Riwayat Dokumen

Perubahan kontrak API dicatat di bagian Riwayat Perubahan pada [docs/API_CONTRACT.md](./docs/API_CONTRACT.md) (versi saat ini: 1.1).

> > > > > > > d93271b6519c9fda82a744d6e6a9876d243a57d4
