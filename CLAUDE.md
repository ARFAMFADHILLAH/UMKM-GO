# Aturan Desain & Pengembangan — UMKM-Go

Acuan wajib untuk AI agent (Claude Code, Cursor, dll.) yang mengerjakan `UMKM-GO/frontend`.
Tempel sebagai project rules / `CLAUDE.md` di root repo. Dokumen ini mengikuti struktur dan
penamaan yang SUDAH ada di kode — jangan bikin token atau pola baru yang menyimpang tanpa
memperbarui dokumen ini juga.

## 1. Konsep produk

UMKM-Go adalah peta + direktori usaha mikro, kecil, dan menengah (UMKM) di Indonesia: kuliner,
kerajinan, fashion, jasa, pertanian. Prioritas: **cepat ditemukan di peta, mudah dihubungi
lewat WhatsApp.** Ini alat transaksi nyata antara warga dan pelaku usaha lokal, bukan katalog
statis atau landing page marketing semata.

Stack: React 19 + React Router + Tailwind CSS v4 (config lewat `@theme` di `src/index.css`,
bukan `tailwind.config.js`) + Leaflet/react-leaflet untuk peta + lucide-react untuk ikon.
Backend Laravel.

## 2. Prinsip desain (jangan dilanggar)

1. **Bukan landing page — ini aplikasi kerja.** Halaman `Home` boleh punya hero, tapi hero
   harus jujur soal produk (peta), bukan ilustrasi generik. Halaman `Explore`, `MapPage`,
   `Dashboard`, `ManageUmkm` adalah UI kerja: prioritaskan kejelasan dan kecepatan scan, bukan
   dekorasi.
2. **Hindari default AI yang klise** — ini sudah pernah kejadian sekali di project ini, jangan
   diulang:
   - Jangan pakai krem hangat (~#faf8f4) + aksen terakota (~#d7683a) + font "Inter Tight"
     tebal. Itu kombinasi default yang sudah dikenali sebagai "buatan AI".
   - Jangan pakai blob gradient blur di pojok section (`bg-*/30 blur-3xl` dkk), pola titik
     dekoratif, atau garis coretan (squiggle underline) di bawah teks judul.
   - Jangan animasikan banyak elemen sekaligus dengan stagger delay (`fade-up` per-item).
     Motion dipakai sangat terbatas, hanya di tempat yang benar-benar butuh.
   - Jangan pakai pin peta bentuk **teardrop generik** (default Leaflet/Google Maps). Pin
     WAJIB berbentuk **kios/tenda ("stall pin")** — lihat `UmkmMap.jsx` — dan warnanya
     mengikuti kategori usaha. Ini signature visual produk, konsisten di semua tempat yang
     menampilkan lokasi.
3. **Bahasa Indonesia natural.** Kalimat aktif, tanpa jargon teknis. Tombol menyebut aksi
   nyata: "Hubungi via WhatsApp", "Cari", "Daftar Sekarang" — bukan "Submit" atau "Kirim".
4. **Satu elemen berani, sisanya tenang.** Warna kategori boleh mencolok di pin, badge, dan
   ikon kategori. Di luar itu UI tetap netral (kertas/tinta/garis tipis).
5. **Root nyata, bukan hiasan:** badge terverifikasi meniru bentuk cap/stempel, tombol kontak
   utama adalah WhatsApp (bukan formulir email), karena itu cara asli UMKM berkomunikasi
   dengan pelanggan di Indonesia.

## 3. Design tokens — sudah didefinisikan di `src/index.css` `@theme`

Jangan buat warna Tailwind arbitrary baru (`bg-[#xxxxxx]`) di komponen. Semua warna harus
lewat token berikut atau ditambahkan ke `@theme` dulu dengan alasan yang jelas.

### Warna
| Token Tailwind | Hex | Peran |
|---|---|---|
| `brand-500` | `#223350` | Chrome gelap: header, hero band, CTA band (dulu namanya "brand" = terakota, sekarang = tenun/indigo) |
| `accent-400` / `accent-500` | `#e4a430` / `#cf8f22` | Aksen utama, `btn-primary`, highlight, angka statistik |
| `wa-500` / `wa-600` | `#2f6b4f` / `#245740` | `btn-wa`, badge terverifikasi, kategori Jasa & Servis |
| `cabai-500` | `#b4402a` | Kategori Kuliner, dipakai terbatas |
| `fashion-500` | `#7a4b8c` | Kategori Fashion |
| `kerajinan-500` | `#bd6328` | Kategori Kerajinan & Kriya |
| `agro-500` | `#6b7a3a` | Kategori Pertanian & Perkebunan |
| `cream-50` / `cream-100` / `cream-200` | `#faf6ee` / `#f1ead9` / `#e4dbc7` | Background & border lembut |
| `ink-900` / `ink-700` / `ink-500` / `ink-400` | `#22261f` … `#7a7e6d` | Teks, dari paling gelap ke paling pudar |

Mapping kategori → warna ada di satu tempat: `src/lib/format.js` (`categoryColor`,
`categoryTextColor`) dan `src/components/map/UmkmMap.jsx` (`CATEGORY_PIN_COLOR`). Kalau
menambah kategori baru, update KEDUA tempat itu sekaligus supaya warna kategori konsisten
antara card, ikon, dan pin peta.

### Tipografi
- **Display** (`font-display`): Plus Jakarta Sans, 500–800 — nama usaha, judul section, H1/H2.
- **Body** (`font-sans`, default): Inter — paragraf, label, deskripsi.
- **Mono** (`font-mono`): JetBrains Mono — angka statistik, jarak, harga, data numerik.
  Jangan pakai mono untuk teks naratif.
- Jangan tambahkan font serif editorial (Fraunces, Playfair, Newsreader). Produk ini utilitas/
  data, bukan majalah.

### Komponen utilitas siap pakai (`@layer components` di `index.css`)
`.container-site`, `.btn` + `.btn-primary` / `.btn-wa` / `.btn-outline` / `.btn-ghost`,
`.field`, `.label-caption`, `.card`. Pakai class ini dulu sebelum menulis utility Tailwind
manual berulang — konsistensi lebih penting daripada micro-optimization spacing per halaman.

## 4. Komponen & pola yang sudah ada — jangan duplikasi

- `components/UmkmCard.jsx` — kartu usaha untuk grid (`Home`, `Explore`). Badge kategori di
  pojok kiri-atas thumbnail, tombol WhatsApp di kanan-bawah footer.
- `components/ui/CategoryIcon.jsx` — ikon bulat warna kategori, dipakai di grid kategori
  `Home` dan tempat lain yang butuh identitas kategori ringkas.
- `components/map/UmkmMap.jsx` — satu-satunya tempat render peta Leaflet + pin kios. Semua
  halaman yang butuh peta (`MapPage`, detail UMKM dengan lokasi) pakai komponen ini, jangan
  bikin instance `MapContainer` baru di tempat lain.
- `components/ui/EmptyState.jsx` — dipakai untuk state kosong (belum ada pin, hasil pencarian
  kosong, dsb). Selalu kasih judul + deskripsi yang mengarahkan aksi, bukan pesan sistem
  generik ("No results found").
- Tile peta: CartoDB Voyager (`{s}.basemaps.cartocdn.com/rastertiles/voyager`), bukan tile OSM
  default — lebih bersih dan cocok dengan palet produk. Jangan ganti tanpa alasan kuat.

## 5. Data model UMKM (sudah dipakai di backend Laravel & frontend)

Field kunci yang dikonsumsi frontend: `id`, `slug`, `name`, `category` (`{id, name}`),
`description`, `city`, `province`, `latitude`, `longitude`, `phone_whatsapp`,
`image_cover`, `instagram`. Kalau menambah field baru di backend, pastikan `lib/format.js`
dan komponen terkait diperbarui bersamaan, jangan biarkan field mentah bocor ke UI tanpa
formatter (nomor telepon, tanggal, dsb. selalu lewat `lib/format.js`).

## 6. Aksesibilitas & performa

- Semua interaktif elemen (`btn`, `field`, link kartu) pakai `focus-visible:outline-2` — sudah
  ada di class `.btn`, jangan hilangkan saat menulis komponen baru.
- Kontras teks vs background minimal WCAG AA — cek khusus teks `ink-400`/`ink-500` di atas
  `cream-50`, itu kombinasi paling rawan gagal kontras.
- Gambar UMKM (`image_cover`) selalu `loading="lazy"`, fallback ke placeholder warna kategori
  + ikon `Store` kalau kosong (pola sudah ada di `UmkmCard.jsx`, ikuti pola yang sama).
- Peta harus tetap berfungsi meski tanpa geolokasi user — jangan blokir render karena
  `navigator.geolocation` ditolak.
- Uji responsif di breakpoint ~360px, ~768px, dan desktop lebar. Sidebar/panel peta di mobile
  sebaiknya jadi bottom sheet, bukan modal penuh yang menutup peta total.

## 7. Larangan eksplisit

- Jangan kembalikan warna ke krem+terakota atau font Inter Tight — itu revisi yang sudah
  sengaja diganti karena kesan "AI slop".
- Jangan pakai foto stok generik ("corporate handshake", ilustrasi flat people-vector) untuk
  konten UMKM. Placeholder foto = warna kategori + ikon `Store`, bukan foto stok asing.
- Jangan pakai emoji sebagai pengganti ikon di UI produksi — pakai `lucide-react`.
- Jangan bikin ulang pin peta jadi teardrop demi "kemudahan" — itu menghilangkan identitas
  visual produk. Kalau perlu variasi ukuran (pin terpilih vs biasa), gunakan parameter
  `selected` yang sudah ada di `makePin()`.
- Jangan menambah section marketing generik di `Home` (testimoni carousel besar, "kenapa
  pilih kami" dengan 3 ikon checklist, dsb.) kecuali diminta eksplisit.
