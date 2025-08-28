# Dokumentasi Fitur Reset Password

## Deskripsi

Fitur reset password memungkinkan pengguna untuk mengatur ulang password mereka jika mereka lupa. Fitur ini menggunakan email untuk mengirimkan tautan reset password yang aman kepada pengguna.

## Alur Kerja

1. Pengguna meminta reset password dengan memasukkan alamat email mereka
2. Sistem memverifikasi bahwa email tersebut terdaftar dalam database
3. Sistem menghasilkan token reset password yang unik dan menyimpannya di database
4. Sistem mengirimkan email dengan tautan reset password yang berisi token
5. Pengguna mengklik tautan dalam email dan diarahkan ke halaman reset password
6. Pengguna memasukkan password baru dan konfirmasi password
7. Sistem memverifikasi token dan mengupdate password pengguna

## Endpoints API

### 1. Meminta Reset Password

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response Sukses (200):**
```json
{
  "success": true,
  "message": "Permintaan reset kata sandi berhasil dikirim. Silakan periksa email Anda untuk instruksi selanjutnya."
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "User dengan email tersebut tidak ditemukan"
}
```

### 2. Reset Password dengan Token

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "token_reset_password_dari_email",
  "password": "password_baru",
  "confirmPassword": "konfirmasi_password_baru"
}
```

**Response Sukses (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah. Silakan login dengan password baru Anda."
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Token tidak valid atau sudah kedaluwarsa"
}
```

## Konfigurasi Email

Untuk menggunakan fitur ini, Anda perlu mengatur variabel lingkungan berikut di file `.env`:

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Inventory System <your-email@gmail.com>
FRONTEND_URL=http://localhost:3000
```

### Catatan untuk Gmail

Jika Anda menggunakan Gmail, Anda perlu menggunakan "App Password" dan bukan password akun Gmail Anda. Untuk mendapatkan App Password:

1. Aktifkan verifikasi 2 langkah di akun Google Anda
2. Kunjungi [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Pilih "App" dan "Device", lalu klik "Generate"
4. Gunakan password yang dihasilkan sebagai nilai untuk `EMAIL_PASSWORD`

### Mengatasi Error Autentikasi Email

Jika Anda melihat error seperti berikut:
```
Error sending email: Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to
535 5.7.8 https://support.google.com/mail/?p=BadCredentials - gsmtp
```

Ini menunjukkan bahwa kredensial email Anda tidak valid. Pastikan untuk:

1. Menggunakan alamat email yang benar di `EMAIL_USER`
2. Menggunakan App Password yang valid di `EMAIL_PASSWORD` (bukan password akun biasa)
3. Memastikan bahwa verifikasi 2 langkah telah diaktifkan di akun Google Anda
4. Memastikan bahwa "Less secure app access" dimatikan di akun Google Anda

## Migrasi Database

Untuk menggunakan fitur ini, Anda perlu menjalankan migrasi database untuk menambahkan kolom yang diperlukan:

```sql
-- Menambahkan kolom email ke tabel users
ALTER TABLE users ADD COLUMN email VARCHAR(255) AFTER nama_user;

-- Menambahkan kolom untuk token reset password
ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN reset_password_expires DATETIME DEFAULT NULL;

-- Menambahkan indeks pada kolom email untuk pencarian yang lebih cepat
ALTER TABLE users ADD INDEX idx_email (email);

-- Menambahkan indeks pada kolom reset_password_token untuk pencarian yang lebih cepat
ALTER TABLE users ADD INDEX idx_reset_password_token (reset_password_token);
```

File migrasi ini tersedia di `migrations/add_email_reset_token_columns.sql`.

### Cara Menjalankan Migrasi

Anda dapat menjalankan migrasi dengan salah satu cara berikut:

1. Menggunakan MySQL CLI:
   ```bash
   mysql -u [username] -p [database_name] < migrations/add_email_reset_token_columns.sql
   ```

2. Menggunakan phpMyAdmin atau MySQL Workbench:
   - Buka database Anda
   - Buka tab SQL atau Query
   - Salin dan tempel isi file SQL
   - Jalankan query

3. Menggunakan aplikasi database lain yang Anda gunakan

**Penting:** Pastikan untuk membuat backup database Anda sebelum menjalankan migrasi.

## Keamanan

- Token reset password hanya berlaku selama 1 jam
- Token disimpan dalam bentuk hash di database
- Email berisi tautan yang unik untuk setiap permintaan reset password
- Setelah password diubah, token akan dihapus dari database