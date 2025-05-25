# API Inventory Management

## Deskripsi

API Inventory Management adalah backend API untuk sistem manajemen inventaris yang dibangun dengan Node.js, Express, dan MySQL. API ini menyediakan endpoint untuk mengelola barang, kategori, supplier, lokasi, transaksi masuk/keluar, stok opname, pengguna, dan log aktivitas.

## Fitur

- Manajemen barang (CRUD)
- Manajemen kategori, supplier, dan lokasi
- Pencatatan transaksi masuk (pembelian)
- Pencatatan transaksi keluar (pengeluaran)
- Stok opname (audit stok)
- Manajemen pengguna
- Pencatatan log aktivitas

## Teknologi yang Digunakan

- Node.js
- Express.js
- MySQL (dengan Laragon)
- Dotenv untuk konfigurasi
- CORS untuk cross-origin resource sharing

## Cara Menjalankan

1. Clone repository ini
2. Install dependencies dengan menjalankan `npm install`
3. Buat file `.env` dengan isi sebagai berikut:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=inventory_db
```

4. Pastikan database MySQL sudah berjalan (dengan Laragon)
5. Jalankan aplikasi dengan perintah `npm run dev` untuk mode development

## Struktur Database

API ini menggunakan struktur database sebagai berikut:

- `kategori`: Menyimpan kategori barang
- `supplier`: Menyimpan data supplier
- `lokasi`: Menyimpan lokasi penyimpanan barang
- `barang`: Menyimpan data barang
- `transaksi_masuk`: Menyimpan data transaksi masuk (pembelian)
- `detail_transaksi_masuk`: Menyimpan detail item transaksi masuk
- `transaksi_keluar`: Menyimpan data transaksi keluar (pengeluaran)
- `detail_transaksi_keluar`: Menyimpan detail item transaksi keluar
- `stok_opname`: Menyimpan data stok opname (audit stok)
- `detail_stok_opname`: Menyimpan detail item stok opname
- `pengguna`: Menyimpan data pengguna
- `log_aktivitas`: Menyimpan log aktivitas pengguna

## Endpoint API

### Status API

- `GET /api/status`: Memeriksa status API dan koneksi database

### Barang

- `GET /api/barang`: Mendapatkan semua data barang
- `GET /api/barang/:id`: Mendapatkan data barang berdasarkan ID
- `POST /api/barang`: Menambahkan barang baru
- `PUT /api/barang/:id`: Mengupdate data barang
- `DELETE /api/barang/:id`: Menghapus data barang

### Kategori

- `GET /api/kategori`: Mendapatkan semua data kategori
- `GET /api/kategori/:id`: Mendapatkan data kategori berdasarkan ID
- `POST /api/kategori`: Menambahkan kategori baru

### Supplier

- `GET /api/supplier`: Mendapatkan semua data supplier
- `GET /api/supplier/:id`: Mendapatkan data supplier berdasarkan ID
- `POST /api/supplier`: Menambahkan supplier baru

### Lokasi

- `GET /api/lokasi`: Mendapatkan semua data lokasi
- `GET /api/lokasi/:id`: Mendapatkan data lokasi berdasarkan ID
- `POST /api/lokasi`: Menambahkan lokasi baru

### Transaksi Masuk

- `GET /api/transaksi-masuk`: Mendapatkan semua data transaksi masuk
- `GET /api/transaksi-masuk/:id`: Mendapatkan data transaksi masuk berdasarkan ID
- `POST /api/transaksi-masuk`: Membuat transaksi masuk baru

### Transaksi Keluar

- `GET /api/transaksi-keluar`: Mendapatkan semua data transaksi keluar
- `GET /api/transaksi-keluar/:id`: Mendapatkan data transaksi keluar berdasarkan ID
- `POST /api/transaksi-keluar`: Membuat transaksi keluar baru

### Stok Opname

- `GET /api/stok-opname`: Mendapatkan semua data stok opname
- `GET /api/stok-opname/:id`: Mendapatkan data stok opname berdasarkan ID
- `POST /api/stok-opname`: Membuat stok opname baru
- `PUT /api/stok-opname/:id/selesai`: Mengubah status stok opname menjadi selesai

### Pengguna

- `GET /api/pengguna`: Mendapatkan semua data pengguna
- `GET /api/pengguna/:id`: Mendapatkan data pengguna berdasarkan ID
- `POST /api/pengguna`: Menambahkan pengguna baru

### Log Aktivitas

- `GET /api/log-aktivitas`: Mendapatkan semua data log aktivitas

## Kontribusi

Kontribusi selalu diterima. Silakan buat pull request untuk berkontribusi pada proyek ini.

## Lisensi

MIT License