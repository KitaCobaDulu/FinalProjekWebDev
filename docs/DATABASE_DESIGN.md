# Desain Database: Lost & Found Website

RISTEK Fasilkom UI Open Class Web Development 2026, Final Project.

Dokumen ini menjelaskan desain database PostgreSQL dan rencana pemetaannya ke schema Prisma.

- Versi dokumen: 1.0
- Database: PostgreSQL
- ORM: Prisma ORM
- Selaras dengan: `API_CONTRACT.md` dan `PRD.md`

---

## 1. Ringkasan Desain

Aplikasi tidak memiliki sistem login dan hanya mengelola satu jenis data, yaitu laporan barang hilang atau ditemukan. Karena itu desain database dibuat sederhana: **satu tabel utama (`Report`)** dan **empat tipe enum**. Tidak ada relasi antartabel.

### Keputusan desain

|Keputusan|Pilihan|Alasan|
|---|---|---|
|Jumlah tabel|1 tabel (`Report`)|Tidak ada entitas lain yang berdiri sendiri (tanpa akun pengguna)|
|Kategori|Enum, bukan tabel terpisah|Hanya 6 nilai tetap; lebih sederhana dan nilainya divalidasi otomatis|
|Lokasi|Teks bebas (`String`)|Disepakati tim; filter memakai pencarian "mengandung kata"|
|Kontak|Satu pasang `contactType` + `contactValue`|Menjamin hanya kontak pilihan pelapor yang tersimpan dan tampil|
|Penyelesaian laporan|Kolom `status` (`ACTIVE`/`RESOLVED`), bukan hapus data|Riwayat tetap tersimpan; tidak perlu endpoint `DELETE` publik|
|Foto|Hanya menyimpan URL Cloudinary|File gambar tidak disimpan di database|
|Aturan "deskripsi atau foto"|Divalidasi di kode backend|Lebih mudah diberi pesan error yang jelas|

---

## 2. Diagram Entitas (ERD)

```
┌──────────────────────────────────────────────┐
│                   Report                     │
├──────────────────────────────────────────────┤
│ PK  id            INTEGER  (auto increment)  │
│     type          ReportType     NOT NULL    │
│     itemName      TEXT           NOT NULL    │
│     description   TEXT           NULL        │
│     category      Category       NOT NULL    │
│     location      TEXT           NOT NULL    │
│     date          TIMESTAMP      NOT NULL    │
│     imageUrl      TEXT           NULL        │
│     reporterName  TEXT           NOT NULL    │
│     contactType   ContactType    NOT NULL    │
│     contactValue  TEXT           NOT NULL    │
│     status        ReportStatus   NOT NULL    │
│                   DEFAULT 'ACTIVE'           │
│     createdAt     TIMESTAMP      NOT NULL    │
│                   DEFAULT now()              │
└──────────────────────────────────────────────┘
        Tidak ada relasi ke tabel lain.
```

---

## 3. Definisi Enum

|Enum|Nilai|Dipakai oleh|
|---|---|---|
|`ReportType`|`LOST`, `FOUND`|`type`|
|`Category`|`ELECTRONIC`, `DOCUMENT_CARD`, `TUMBLER`, `ACCESSORY`, `STATIONERY`, `OTHER`|`category`|
|`ContactType`|`WHATSAPP`, `LINE`, `INSTAGRAM`, `EMAIL`|`contactType`|
|`ReportStatus`|`ACTIVE`, `RESOLVED`|`status`|

Pemetaan tampilan kategori di UI:

|Nilai database/API|Tampilan UI|
|---|---|
|`ELECTRONIC`|Electronic|
|`DOCUMENT_CARD`|Document & Card|
|`TUMBLER`|Tumbler|
|`ACCESSORY`|Accessory|
|`STATIONERY`|Stationery|
|`OTHER`|Other|

---

## 4. Definisi Tabel `Report`

| No  | Kolom          | Tipe Prisma    | Tipe PostgreSQL      | Wajib     | Nilai bawaan   | Keterangan                                                 |
| --- | -------------- | -------------- | -------------------- | --------- | -------------- | ---------------------------------------------------------- |
| 1   | `id`           | `Int`          | `SERIAL` / `INTEGER` | Ya        | auto increment | Kunci utama                                                |
| 2   | `type`         | `ReportType`   | enum                 | Ya        | -              | Jenis laporan                                              |
| 3   | `itemName`     | `String`       | `TEXT`               | Ya        | -              | Nama barang, 3 sampai 100 karakter                         |
| 4   | `description`  | `String?`      | `TEXT`               | Bersyarat | `NULL`         | Maksimum 500 karakter                                      |
| 5   | `category`     | `Category`     | enum                 | Ya        | -              | Kategori barang                                            |
| 6   | `location`     | `String`       | `TEXT`               | Ya        | -              | Teks bebas, 2 sampai 100 karakter                          |
| 7   | `date`         | `DateTime`     | `TIMESTAMP(3)`       | Ya        | -              | Tanggal barang hilang/ditemukan, tidak boleh di masa depan |
| 8   | `imageUrl`     | `String?`      | `TEXT`               | Bersyarat | `NULL`         | URL aman (https) dari Cloudinary                           |
| 9   | `reporterName` | `String`       | `TEXT`               | Ya        | -              | 2 sampai 100 karakter                                      |
| 10  | `contactType`  | `ContactType`  | enum                 | Ya        | -              | Metode kontak yang dipilih untuk tampil publik             |
| 11  | `contactValue` | `String`       | `TEXT`               | Ya        | -              | Isi kontak; berformat email jika `contactType` = `EMAIL`   |
| 12  | `status`       | `ReportStatus` | enum                 | Ya        | `ACTIVE`       | Status laporan                                             |
| 13  | `createdAt`    | `DateTime`     | `TIMESTAMP(3)`       | Ya        | `now()`        | Waktu laporan dibuat                                       |

Keterangan:

- **Bersyarat** berarti kolom boleh `NULL`, tetapi **minimal salah satu** dari `description` atau `imageUrl` harus terisi (lihat bagian 6).
- Batas panjang karakter dikontrol di lapisan validasi backend, bukan di tipe kolom (`TEXT` tidak membatasi panjang).
- `date` untuk input `YYYY-MM-DD` disimpan sebagai pukul 00:00 UTC pada tanggal tersebut.

---

## 5. Relasi

**Tidak ada relasi.** Tabel `Report` berdiri sendiri. kategori dan lokasi tidak dibuat tabel terpisah:

- **Kategori** hanya 6 nilai tetap, sehingga enum sudah cukup.
- **Lokasi** berupa teks bebas sesuai kesepakatan tim.

---

## 6. Aturan Integritas Data

|No|Aturan|Ditegakkan di|
|---|---|---|
|1|`type`, `category`, `contactType`, `status` hanya menerima nilai enum|Database (enum) dan validasi backend|
|2|Kolom wajib tidak boleh `NULL`|Database (`NOT NULL`) dan validasi backend|
|3|Minimal salah satu dari `description` atau `imageUrl` terisi|**Validasi backend**|
|4|`description` berisi spasi saja dianggap kosong dan disimpan sebagai `NULL`|Validasi backend (`trim`)|
|5|Klien tidak boleh menentukan `id`, `status`, `createdAt`, `imageUrl`|Backend mengabaikan field tersebut|
|6|Hanya satu metode kontak yang disimpan dan dikirim ke publik|Desain tabel (satu pasang kolom)|
|7|Tanggal laporan tidak boleh di masa depan|Validasi backend|

Aturan nomor 3 sengaja tidak dibuat sebagai `CHECK` constraint di database. Validasi di kode backend dapat memberi pesan error yang spesifik (`field: "description"`) dan lebih mudah dipelajari. Jika ingin lapisan pengaman tambahan, constraint dapat ditambahkan lewat migrasi SQL manual:

```sql
ALTER TABLE "Report"
ADD CONSTRAINT report_description_or_image
CHECK (
  (description IS NOT NULL AND btrim(description) <> '')
  OR "imageUrl" IS NOT NULL
);
```

---

## 7. Rencana Pemetaan ke Schema Prisma

Berikut draft rencana pemetaan ke schema prisma:

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

  @@index([status, createdAt])
  @@index([type])
  @@index([category])
}
```

---

## 8. Pemetaan Query API ke Prisma

|Kebutuhan|Parameter API|Penerapan di Prisma (`where`)|
|---|---|---|
|Hanya laporan aktif|(otomatis)|`status: "ACTIVE"`|
|Cari nama barang|`search`|`itemName: { contains: search, mode: "insensitive" }`|
|Filter jenis|`type`|`type: "LOST"`|
|Filter kategori|`category`|`category: "TUMBLER"`|
|Filter lokasi|`location`|`location: { contains: location, mode: "insensitive" }`|
|Urutan|(otomatis)|`orderBy: { createdAt: "desc" }`|
|Halaman|`page`, `limit`|`skip: (page - 1) * limit`, `take: limit`|
|Total data|-|`prisma.report.count({ where })`|

Contoh gabungan:

```js
const where = {
  status: "ACTIVE",
  ...(type && { type }),
  ...(category && { category }),
  ...(search && { itemName: { contains: search, mode: "insensitive" } }),
  ...(location && { location: { contains: location, mode: "insensitive" } }),
};

const [data, totalItems] = await Promise.all([
  prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  }),
  prisma.report.count({ where }),
]);

const totalPages = Math.ceil(totalItems / limit);
```

Detail laporan memakai `findUnique({ where: { id } })` **tanpa** filter `status`, sehingga laporan `RESOLVED` tetap dapat dibuka lewat `GET /reports/:id`.

---

## 9. Pemetaan Kolom ke Respons API

Semua kolom dikirim ke klien, dengan nama yang sama persis seperti di `API_CONTRACT.md`:

`id`, `type`, `itemName`, `description`, `category`, `location`, `date`, `imageUrl`, `reporterName`, `contactType`, `contactValue`, `status`, `createdAt`.

Tidak ada kolom internal yang disembunyikan karena tabel hanya berisi data publik. Privasi kontak dijamin oleh desain: hanya satu pasang `contactType` dan `contactValue` yang pernah disimpan.

---

## 10. Data Sampel dan Mock Data

`mockReports.json` berisi 10 laporan yang sesuai dengan tabel ini:

|Aspek|Isi|
|---|---|
|Total|10 laporan|
|Status|8 `ACTIVE`, 2 `RESOLVED` (id 2 bertipe `LOST`, id 6 bertipe `FOUND`)|
|Kategori|Seluruh 6 kategori tercakup|
|Kontak|Seluruh 4 metode kontak tercakup|
|Tanpa foto|Beberapa laporan `imageUrl: null` dan tetap memiliki `description`|

---

## 11. Rencana Migrasi dan Setup Database

### 11.1 Setup lokal

1. Pastikan server PostgreSQL berjalan.
2. Buat database kosong:
    
    ```sql
    CREATE DATABASE lostfound;
    ```
    
3. Instal Prisma:
    
    ```
    npm install prisma --save-dev
    npm install @prisma/client
    npx prisma init
    ```
    
4. Isi `.env`:
    
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/lostfound"
    ```
    
5. Tulis schema (bagian 7), lalu jalankan migrasi pertama:
    
    ```
    npx prisma migrate dev --name init
    ```
    
6. Commit folder `prisma/migrations/` ke GitHub.

### 11.2 Produksi

1. Buat database PostgreSQL di layanan hosting, lalu salin connection string-nya.
2. Isi `DATABASE_URL` di pengaturan environment layanan hosting (bukan di kode).
3. Terapkan migrasi yang sudah di-commit:
    
    ```
    npx prisma migrate deploy
    ```
    
4. Uji bahwa data tetap ada setelah backend di-restart.

### 11.3 Mengubah status laporan menjadi `RESOLVED`

Dilakukan manual oleh admin (tanpa endpoint publik), lewat salah satu cara:

- **Prisma Studio**: jalankan `npx prisma studio`, buka tabel `Report`, ubah kolom `status`.
- **SQL**:
    
    ```sql
    UPDATE "Report" SET status = 'RESOLVED' WHERE id = 1;
    ```
    

---

## 12. Riwayat Perubahan

| Versi | Tanggal          | Perubahan |
| ----- | ---------------- | --------- |
| 1.0   | 16 November 2026 | Draf awal |
