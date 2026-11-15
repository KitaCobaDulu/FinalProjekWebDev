# API Contract: Lost & Found Website

RISTEK Fasilkom UI Open Class Web Development 2026, Final Project.

Dokumen ini berisi perjanjian antara Backend dan Frontend. Semua nama field, nilai enum, dan bentuk respons di sini bersifat **baku**. Perubahan harus disepakati bersama dan dicatat pada bagian Riwayat Perubahan.

- Versi dokumen: 1.0 (Checkpoint 1)
- Base URL lokal: `http://localhost:3000`
- Base URL produksi: akan diumumkan setelah deployment
- Format data: JSON (`Content-Type: application/json`), kecuali pengiriman foto (lihat bagian 6)
- Autentikasi: tidak ada, semua endpoint publik

---

## 1. Ringkasan Endpoint

| Method | Path | Fungsi | Status sukses | Tersedia sejak |
|--------|------|--------|---------------|----------------|
| GET | `/` | Cek server berjalan | 200 | Checkpoint 2 |
| GET | `/reports` | Daftar laporan (search, filter, pagination) | 200 | Checkpoint 2 |
| GET | `/reports/:id` | Detail satu laporan | 200 | Checkpoint 2 |
| POST | `/reports` | Kirim laporan baru | 201 | Checkpoint 2 (teks), Checkpoint 3 (foto) |

Endpoint `PUT`, `PATCH`, dan `DELETE` **sengaja tidak disediakan** agar publik tidak dapat mengubah atau menghapus laporan.

---

## 2. Objek Report

Bentuk satu laporan pada respons:

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

| Field | Tipe JSON | Boleh `null`? | Keterangan |
|-------|-----------|---------------|------------|
| `id` | number (integer) | Tidak | Penanda unik, dibuat server |
| `type` | string (enum) | Tidak | `LOST` atau `FOUND` |
| `itemName` | string | Tidak | Nama barang |
| `description` | string | **Ya** | Ciri-ciri barang; `null` jika tidak diisi |
| `category` | string (enum) | Tidak | Lihat bagian 3 |
| `location` | string | Tidak | Teks bebas |
| `date` | string (ISO 8601, UTC) | Tidak | Tanggal barang hilang/ditemukan |
| `imageUrl` | string (URL) | **Ya** | `null` jika tanpa foto, maka FE menampilkan placeholder |
| `reporterName` | string | Tidak | Nama pelapor |
| `contactType` | string (enum) | Tidak | Metode kontak yang dipilih pelapor |
| `contactValue` | string | Tidak | Isi kontak sesuai `contactType` |
| `status` | string (enum) | Tidak | `ACTIVE` atau `RESOLVED` |
| `createdAt` | string (ISO 8601, UTC) | Tidak | Waktu laporan dibuat |

### Aturan privasi kontak

Respons **hanya** memuat satu metode kontak, yaitu pasangan `contactType` dan `contactValue` yang dipilih pelapor. Tidak ada field kontak lain yang pernah dikirim ke publik.

### Aturan untuk Frontend

- Jika `imageUrl` bernilai `null`, tampilkan gambar placeholder bawaan.
- Jika `description` bernilai `null`, sembunyikan bagian deskripsi atau tampilkan teks pengganti seperti "Tidak ada deskripsi".
- Tampilkan `date` dan `createdAt` dalam zona waktu lokal pengguna (WIB), karena server mengirim UTC.

---

## 3. Nilai Enum

| Enum | Nilai yang valid |
|------|------------------|
| `type` | `LOST`, `FOUND` |
| `category` | `ELECTRONIC`, `DOCUMENT_CARD`, `TUMBLER`, `ACCESSORIES`, `ATK`, `OTHER` |
| `contactType` | `WHATSAPP`, `LINE`, `INSTAGRAM`, `EMAIL` |
| `status` | `ACTIVE`, `RESOLVED` |

Nilai enum **peka huruf besar/kecil** dan harus ditulis persis seperti di atas.

Pemetaan tampilan kategori di UI:

| Tampilan UI | Nilai API |
|-------------|-----------|
| Electronic | `ELECTRONIC` |
| Dokumen & Card | `DOCUMENT_CARD` |
| Tumbler | `TUMBLER` |
| Accessories | `ACCESSORIES` |
| ATK | `ATK` |
| Other | `OTHER` |

Pemetaan tampilan metode kontak yang disarankan: `WHATSAPP` tampil sebagai "WhatsApp", `LINE` sebagai "LINE", `INSTAGRAM` sebagai "Instagram", `EMAIL` sebagai "Email".

---

## 4. Format Respons Standar

### 4.1 Sukses, satu data

```json
{
  "success": true,
  "data": { }
}
```

### 4.2 Sukses, daftar

```json
{
  "success": true,
  "data": [ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 10,
    "totalPages": 1
  }
}
```

### 4.3 Error

```json
{
  "success": false,
  "message": "Pesan error yang ditulis dalam bahasa Indonesia"
}
```

### 4.4 Error validasi (khusus status 400 pada POST)

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [
    { "field": "itemName", "message": "itemName wajib diisi" },
    { "field": "category", "message": "category harus salah satu dari: ELECTRONIC, DOCUMENT_CARD, TUMBLER, ACCESSORIES, ATK, OTHER" }
  ]
}
```

Setiap elemen `errors` berisi nama field dan pesan yang dapat ditampilkan di bawah input form terkait.

---

## 5. Endpoint

### 5.1 `GET /`

Cek kesehatan server.

Respons 200:

```json
{ "message": "Lost & Found API berjalan" }
```

(Endpoint ini satu-satunya yang tidak memakai format `success/data`.)

---

### 5.2 `GET /reports`

Mengambil daftar laporan dengan pencarian, filter, dan pagination.

#### Query parameter

Semua parameter bersifat opsional dan dapat digabung.

| Parameter  | Tipe    | Bawaan       | Aturan                                                                                                                                                            |
| ---------- | ------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `search`   | string  | tanpa filter | Mencari pada `itemName`. Cocok jika **mengandung** kata, tidak peka huruf besar/kecil. Spasi di awal dan akhir diabaikan. Nilai kosong dianggap tidak ada filter. |
| `type`     | enum    | tanpa filter | `LOST` atau `FOUND`                                                                                                                                               |
| `category` | enum    | tanpa filter | Salah satu dari 6 kategori                                                                                                                                        |
| `location` | string  | tanpa filter | Cocok jika `location` **mengandung** kata tersebut, tidak peka huruf besar/kecil                                                                                  |
| `page`     | integer | `1`          | Bilangan bulat, minimum `1`                                                                                                                                       |
| `limit`    | integer | `10`         | Bilangan bulat, minimum `1`. Nilai di atas `50` dibatasi menjadi `50`                                                                                             |

#### Perilaku

- Hanya laporan berstatus `ACTIVE` yang dikembalikan.
- Urutan hasil: `createdAt` **terbaru lebih dulu**.
- Jika beberapa filter dipakai bersamaan, laporan harus memenuhi **semua** filter (logika AND).
- `totalItems` adalah jumlah laporan yang cocok dengan filter (bukan jumlah seluruh data), dan `totalPages = ceil(totalItems / limit)`.
- Jika tidak ada hasil: status 200 dengan `data: []`, `totalItems: 0`, `totalPages: 0`.
- Jika `page` melebihi `totalPages`: status 200 dengan `data: []` (bukan error).
- Field `limit` pada `pagination` menunjukkan nilai yang **benar-benar dipakai** (setelah dibatasi).

#### Contoh request

```
GET /reports?type=LOST&category=TUMBLER&search=biru&page=1&limit=10
```

#### Respons 200

```json
{
  "success": true,
  "data": [
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
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

#### Respons error

| Status | Kondisi | Contoh `message` |
|--------|---------|------------------|
| 400 | `type` bukan `LOST`/`FOUND` | `Parameter type harus LOST atau FOUND` |
| 400 | `category` bukan salah satu enum | `Parameter category tidak valid` |
| 400 | `page` atau `limit` bukan bilangan bulat positif | `Parameter page harus bilangan bulat positif` |
| 500 | Kesalahan server | `Terjadi kesalahan pada server` |

---

### 5.3 `GET /reports/:id`

Mengambil detail satu laporan.

| Parameter path | Tipe | Aturan |
|----------------|------|--------|
| `id` | integer | Bilangan bulat positif |

#### Contoh request

```
GET /reports/4
```

#### Respons 200

```json
{
  "success": true,
  "data": {
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
}
```

#### Respons error

| Status | Kondisi | `message` |
|--------|---------|-----------|
| 400 | `id` bukan bilangan bulat positif (contoh: `/reports/abc`) | `ID laporan tidak valid` |
| 404 | Tidak ada laporan dengan id tersebut | `Laporan tidak ditemukan` |
| 500 | Kesalahan server | `Terjadi kesalahan pada server` |

Catatan: laporan berstatus `RESOLVED` tetap dapat dibuka lewat detail (tidak 404), tetapi tidak muncul di daftar.

---

### 5.4 `POST /reports`

Mengirim laporan baru.

#### Format pengiriman

| Tahap | Content-Type | Foto |
|-------|--------------|------|
| Checkpoint 2 | `application/json` | Belum didukung |
| Checkpoint 3 | `multipart/form-data` | Opsional, field `image` |

Pada Checkpoint 3, server tetap menerima `application/json` untuk laporan tanpa foto, dan `multipart/form-data` untuk laporan dengan atau tanpa foto. Rincian di bagian 6.

#### Field request

| Field | Wajib | Aturan validasi |
|-------|-------|-----------------|
| `type` | Ya | `LOST` atau `FOUND` |
| `itemName` | Ya | 3 sampai 100 karakter setelah spasi di awal/akhir dibuang |
| `description` | Tidak | Maksimum 500 karakter; string kosong disimpan sebagai `null` |
| `category` | Ya | Salah satu dari 6 enum |
| `location` | Ya | 2 sampai 100 karakter |
| `date` | Ya | Format `YYYY-MM-DD` atau ISO 8601 lengkap; harus tanggal valid dan **tidak di masa depan** |
| `reporterName` | Ya | 2 sampai 100 karakter |
| `contactType` | Ya | Salah satu dari 4 enum |
| `contactValue` | Ya | 1 sampai 100 karakter; jika `contactType` = `EMAIL`, harus berformat email yang valid |
| `image` | Tidak | Hanya Checkpoint 3. Lihat bagian 6 |

Field yang **diabaikan server** jika dikirim klien: `id`, `status`, `createdAt`, `imageUrl`. Server selalu mengisinya sendiri (`status` = `ACTIVE`).

#### Contoh request (Checkpoint 2, JSON)

```
POST /reports
Content-Type: application/json
```

```json
{
  "type": "FOUND",
  "itemName": "KTM atas nama Ani",
  "description": "Ditemukan di dekat mesin fotokopi",
  "category": "DOCUMENT_CARD",
  "location": "Perpustakaan Lantai 1",
  "date": "2026-11-12",
  "reporterName": "Citra",
  "contactType": "LINE",
  "contactValue": "citra.line"
}
```

#### Respons 201

`data` berisi laporan lengkap yang baru dibuat:

```json
{
  "success": true,
  "data": {
    "id": 11,
    "type": "FOUND",
    "itemName": "KTM atas nama Ani",
    "description": "Ditemukan di dekat mesin fotokopi",
    "category": "DOCUMENT_CARD",
    "location": "Perpustakaan Lantai 1",
    "date": "2026-11-12T00:00:00.000Z",
    "imageUrl": null,
    "reporterName": "Citra",
    "contactType": "LINE",
    "contactValue": "citra.line",
    "status": "ACTIVE",
    "createdAt": "2026-11-15T07:20:00.000Z"
  }
}
```

#### Respons error

| Status | Kondisi | Keterangan |
|--------|---------|------------|
| 400 | Satu atau lebih field tidak lolos validasi | Memakai format error validasi (bagian 4.4), semua kesalahan dikembalikan sekaligus |
| 400 | Body bukan JSON yang valid | `message`: `Format request tidak valid` |
| 400 | Foto tidak valid (Checkpoint 3) | Format error validasi dengan `field: "image"` |
| 500 | Kesalahan server atau gagal mengunggah foto | `Terjadi kesalahan pada server` |

Contoh respons 400:

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [
    { "field": "itemName", "message": "itemName wajib diisi" },
    { "field": "contactValue", "message": "contactValue harus berupa email yang valid" }
  ]
}
```

---

## 6. Pengiriman Foto (Checkpoint 3)

### 6.1 Format

`POST /reports` dengan `Content-Type: multipart/form-data`.

- Semua field teks dikirim sebagai bagian form dengan nama yang sama seperti di bagian 5.4.
- Foto dikirim pada field bernama **`image`** (satu file).
- Jika tidak ada foto, field `image` **tidak disertakan**.
- Seluruh nilai pada form berupa teks; `date` dikirim sebagai string `YYYY-MM-DD`.

### 6.2 Aturan file

| Aturan | Nilai |
|--------|-------|
| Format yang diterima | `image/jpeg`, `image/png`, `image/webp` |
| Ukuran maksimum | 2 MB |
| Jumlah file | 1 |

### 6.3 Alur di server

1. Server membaca form dan file (pustaka `multer`).
2. Server memvalidasi field teks dan file.
3. Jika ada file, server mengunggahnya ke Cloudinary dan mengambil URL aman (`https`).
4. URL disimpan di kolom `imageUrl`. Tanpa file, `imageUrl` = `null`.
5. Server membalas 201 dengan laporan lengkap, termasuk `imageUrl`.

### 6.4 Contoh dari sisi Frontend

```js
const formData = new FormData();
formData.append("type", "LOST");
formData.append("itemName", "Tumbler biru");
formData.append("category", "TUMBLER");
formData.append("location", "Ruang A206");
formData.append("date", "2026-11-10");
formData.append("reporterName", "Budi");
formData.append("contactType", "WHATSAPP");
formData.append("contactValue", "081200000001");
if (file) formData.append("image", file); // hanya jika ada foto

const res = await fetch(`${BASE_URL}/reports`, {
  method: "POST",
  body: formData, // jangan set Content-Type secara manual
});
```

Penting untuk FE: **jangan mengisi header `Content-Type` secara manual** saat memakai `FormData`, karena browser menambahkannya sendiri beserta batas (boundary) yang benar.

### 6.5 Rekomendasi untuk FE

Validasi ukuran dan format file di sisi klien sebelum mengirim, agar pengguna mendapat umpan balik cepat. Server tetap memvalidasi ulang.

---

## 7. Status Code

| Kode | Arti | Dipakai ketika |
|------|------|----------------|
| 200 | OK | Pengambilan data berhasil |
| 201 | Created | Laporan berhasil dibuat |
| 400 | Bad Request | Input atau parameter tidak valid |
| 404 | Not Found | Laporan tidak ada, atau rute tidak dikenal |
| 500 | Internal Server Error | Kesalahan tak terduga di server |

Rute yang tidak dikenal (misalnya `GET /abc`) dan method yang tidak disediakan (misalnya `DELETE /reports/1`) mengembalikan 404:

```json
{
  "success": false,
  "message": "Rute tidak ditemukan"
}
```

---

## 8. CORS

Backend mengizinkan permintaan lintas origin dari alamat frontend. Pada pengembangan lokal, origin Vite bawaan `http://localhost:5173` diizinkan. Setelah frontend dideploy, alamat produksinya perlu diberikan kepada Backend agar ditambahkan ke daftar origin yang diizinkan.

---

## 9. Contoh Pemanggilan dari Frontend

```js
const BASE_URL = "http://localhost:3000";

// Daftar dengan filter
const params = new URLSearchParams({
  type: "LOST",
  category: "TUMBLER",
  search: "biru",
  page: 1,
  limit: 10,
});
const res = await fetch(`${BASE_URL}/reports?${params}`);
const json = await res.json();

if (!res.ok) {
  // json.message berisi pesan kesalahan
} else {
  // json.data = array laporan, json.pagination = info halaman
}
```

---

## 10. Data Sampel

File `mockReports.json` berisi 10 laporan yang mengikuti kontrak ini. Backend memakainya sebagai penyimpanan in-memory awal (Checkpoint 2), dan Frontend memakainya sebagai mock data. Cakupan data:

- 5 laporan `LOST` dan 5 laporan `FOUND`
- Seluruh 6 kategori tercakup
- Seluruh 4 metode kontak tercakup
- 4 laporan tanpa foto (`imageUrl: null`) untuk menguji placeholder
- Semua berstatus `ACTIVE`

URL gambar pada data sampel adalah contoh dan bukan foto asli.

---

## 11. FE Tolong Konfirmasi Apakah sudah sesuai

- [ ] Format respons (bagian 4) sudah sesuai kebutuhan FE
- [ ] Nilai enum dan pemetaan tampilan kategori (bagian 3)
- [ ] Batas panjang field pada form (bagian 5.4)
- [ ] Teks bebas untuk lokasi, filter memakai pencarian "mengandung kata"
- [ ] Alamat origin frontend untuk CORS `http://localhost:5173`?

---

## 12. Riwayat Perubahan

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 15 November 2026 | Draf awal Checkpoint 1 |
