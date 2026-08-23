# UMKM-Go

Website direktori UMKM Indonesia. Monorepo berisi **backend API** dan **frontend web**.

## Struktur

- **`backend/`** — REST API Laravel 13 + Sanctum (PHP 8.4+). Dokumentasi lengkap ada di `backend/README.md`.
- **`frontend/`** — Aplikasi web React 19 + Vite + Tailwind CSS v4.

## Menjalankan

### Backend (port 8000)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173. Vite sudah mem-proxy `/api` dan `/storage` ke `localhost:8000`.

### Akun demo

| Email | Password |
|---|---|
| `tempemendoanmasadam@gmail.com` | `tempemendo@nmas@d4m26` |

## Fitur Frontend

- Beranda: hero + pencarian cepat + kategori populer + UMKM terbaru
- Katalog: filter kategori/kota + kata kunci + pagination
- Detail UMKM: foto, deskripsi, peta Leaflet, tombol Chat WhatsApp (wa.me), link Instagram/website
- Peta interaktif penuh dengan pin lokasi & tombol "Lokasi saya"
- Autentikasi register/login (Bearer token tersimpan di localStorage)
- Dashboard pemilik: daftar UMKM milik user, tambah, edit, hapus
- Form tambah/edit: drag-and-drop upload gambar + marker peta untuk koordinat

## Desain

Palet warna terracotta-panas, font *Inter Tight* (display) + *Inter* (body),
dengan aksen hijau WhatsApp. Jika font tidak termuat (offline), fallback ke system font.

## Runnning

WAJIB cd backend / frontend terlebih dahulu