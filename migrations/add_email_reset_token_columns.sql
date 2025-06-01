-- Menambahkan kolom email ke tabel users
ALTER TABLE users ADD COLUMN email VARCHAR(255) AFTER nama_user;

-- Menambahkan kolom untuk token reset password
ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN reset_password_expires DATETIME DEFAULT NULL;

-- Menambahkan indeks pada kolom email untuk pencarian yang lebih cepat
ALTER TABLE users ADD INDEX idx_email (email);

-- Menambahkan indeks pada kolom reset_password_token untuk pencarian yang lebih cepat
ALTER TABLE users ADD INDEX idx_reset_password_token (reset_password_token);