<p align="center"><img src="https://img.shields.io/badge/Laravel-13-red" alt="Laravel 13"><img src="https://img.shields.io/badge/PHP-8.3+-purple" alt="PHP 8.3+"><img src="https://img.shields.io/badge/Auth-Sanctum-orange" alt="Sanctum"><img src="https://img.shields.io/badge/DB-MySQL-blue" alt="MySQL"></p>

# Direktori UMKM API

Backend REST API untuk direktori UMKM (Usaha Mikro, Kecil, dan Menengah). Proyek ini menyediakan backend untuk mendaftarkan, mencari, dan mengelola data UMKM lengkap dengan autentikasi token, kategori, dan fitur filter.

## Fitur

- **Autentikasi & Otorisasi** menggunakan Laravel Sanctum (Bearer Token)
- **Manajemen UMKM** — CRUD dengan kepemilikan data (hanya pemilik yang dapat mengubah/menghapus)
- **Kategori UMKM** — klasifikasi usaha (Kuliner, Kerajinan Tangan, Fashion, Pertanian & Perkebunan, Jasa & Servis)
- **Pencarian & Filter** — berdasarkan nama/deskripsi, kategori, dan kota
- **Upload Gambar Sampul** — disimpan di `storage/app/public/umkms`
- **Paginasi** — 10 data per halaman

## Tech Stack

- [Laravel](https://laravel.com) 13
- PHP 8.3+
- MySQL
- Laravel Sanctum (autentikasi token)
- Laravel Pint (code style)

## Persyaratan

- PHP 8.3 atau lebih baru
- Composer 2
- MySQL 8+ (atau SQLite untuk pengembangan ringan)
- Node.js & NPM (untuk build frontend aset)

## Instalasi

```bash
# 1. Install dependency
composer install

# 2. Buat file .env (salin dari contoh)
cp .env.example .env

# 3. Generate application key
php artisan key:generate

# 4. Konfigurasi database di file .env
#    DB_CONNECTION=mysql
#    DB_DATABASE=direktori_umkm
#    DB_USERNAME=root
#    DB_PASSWORD=

# 5. Jalankan migrasi dan seeder
php artisan migrate --seed

# 6. Jalankan server
php artisan serve
```

Server akan berjalan di `http://localhost:8000`.

### Kredensial Seeder

| Email | Password |
|---|---|
| `budi@gmail.com` | `password` |

## Dokumentasi API

Base URL: `http://localhost:8000/api`

### Endpoint Publik (tanpa token)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/register` | Registrasi user baru |
| `POST` | `/api/login` | Login dan mendapatkan token |
| `GET` | `/api/categories` | Daftar semua kategori |
| `GET` | `/api/umkms` | Daftar UMKM terverifikasi (dengan filter) |
| `GET` | `/api/umkms/{slug}` | Detail UMKM berdasarkan slug |

### Endpoint Terproteksi (perlu `Authorization: Bearer <token>`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/logout` | Logout dan hapus token aktif |
| `GET` | `/api/me` | Info user yang sedang login |
| `POST` | `/api/umkms` | Daftarkan UMKM baru |
| `POST` | `/api/umkms/{id}` | Ubah UMKM (owner saja, gunakan `_method=PUT` untuk upload gambar) |
| `DELETE` | `/api/umkms/{id}` | Hapus UMKM (owner saja) |

### Parameter Filter `GET /api/umkms`

| Parameter | Deskripsi | Contoh |
|---|---|---|
| `search` | Cari berdasarkan nama atau deskripsi | `?search=kripik` |
| `category_id` | Filter berdasarkan kategori | `?category_id=1` |
| `city` | Filter berdasarkan kota | `?city=malang` |

### Contoh Request & Response

**Registrasi**

```http
POST /api/register
Content-Type: application/json

{
  "name": "Budi Mulya",
  "email": "budi@gmail.com",
  "password": "password"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "name": "Budi Mulya",
    "email": "budi@gmail.com"
  },
  "access_token": "1|xxxxxxxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer"
}
```

**Login**

```http
POST /api/login
Content-Type: application/json

{
  "email": "budi@gmail.com",
  "password": "password"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": { "id": 1, "name": "Budi Mulya", "email": "budi@gmail.com" },
  "access_token": "1|xxxxxxxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer"
}
```

**Daftar UMKM**

```http
GET /api/umkms?category_id=1&city=malang
Authorization: Bearer 1|xxxxxxxxxxxxxxxxxxxxxxxx
```

**Response:**

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "name": "Kripik Tempe Oemah",
      "slug": "kripik-tempe-oemah",
      "description": "Keripik tempe renyah khas buatan rumah dengan bumbu rempah pilihan tanpa pengawet.",
      "address": "Jl. Merdeka No. 45, Kecamatan Lowokwaru",
      "province": "Jawa Timur",
      "city": "Kota Malang",
      "phone_whatsapp": "6281234567890",
      "instagram": "kripiktempe_oemah",
      "website_url": null,
      "image_cover": "http://localhost:8000/storage/umkms/xxx.jpg",
      "latitude": null,
      "longitude": null,
      "category": { "id": 1, "name": "Kuliner", "slug": "kuliner" },
      "created_at": "2026-08-20 10:00:00"
    }
  ],
  "last_page": 1,
  "per_page": 10,
  "total": 1
}
```

**Daftarkan UMKM (multipart/form-data)**

```http
POST /api/umkms
Authorization: Bearer 1|xxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: multipart/form-data

category_id=1
name=Kripik Tempe Oemah
description=Keripik tempe renyah khas buatan rumah.
address=Jl. Merdeka No. 45, Lowokwaru
province=Jawa Timur
city=Kota Malang
phone_whatsapp=6281234567890
instagram=kripiktempe_oemah
image_cover=@/path/to/gambar.jpg
```

**Response (201):**

```json
{
  "success": true,
  "message": "UMKM berhasil didaftarkan!",
  "data": { "...": "data UMKM sesuai UmkmResource" }
}
```

## Struktur Proyek

```
app/
├── Http/
│   ├── Controllers/API/
│   │   ├── AuthController.php      # register, login, logout, me
│   │   ├── CategoryController.php  # daftar kategori
│   │   └── UmkmController.php      # CRUD UMKM (index, show, store, update, destroy)
│   └── Resources/
│       └── UmkmResource.php        # Format response JSON UMKM
├── Models/
│   ├── Category.php
│   ├── Umkm.php
│   └── User.php
database/
├── migrations/                     # users, categories, umkms, personal_access_tokens, dll
├── seeders/
│   ├── CategorySeeder.php          # 5 kategori default
│   └── UmkmSeeder.php              # Contoh user & UMKM
routes/
└── api.php                         # Definisi endpoint API
```

## Menjalankan Test

```bash
composer test
```

## License

MIT License — silakan gunakan dan kembangkan untuk kebutuhan Anda.