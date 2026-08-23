# DESIGN.md — Sistem Desain UMKM-Go

Dokumen ini mendeskripsikan sistem desain **yang sedang berjalan** di `UMKM-GO/frontend`.
Ini bukan aspirasi atau moodboard — semua token, class, dan pola di sini sudah ada di kode.
Kalau Anda mengubah tampilan, perbarui dokumen ini di commit yang sama.

Dokumen pendamping: `CLAUDE.md` (aturan pengembangan & larangan). Kalau ada konflik,
`CLAUDE.md` menang untuk urusan aturan, `DESIGN.md` menang untuk urusan nilai token.

---

## 1. Karakter visual

UMKM-Go tampil sebagai **alat kerja yang tenang dan tegas**, bukan brosur.

| Aspek | Arah yang dipakai | Yang dihindari |
|---|---|---|
| Bidang | Kertas terang, panel putih bersih, chrome tinta nyaris hitam | Krem berat, panel abu-abu kusam |
| Bentuk | Sudut membulat sedang (8–16px), sudut tegas untuk label | Kapsul/pil, bubble, blob |
| Bayangan | Berlapis dan pendek, warna tinta bukan hitam murni | Bayangan lebar difus, glow |
| Warna | Netral dominan, satu warna kategori per konteks | Pelangi kategori di satu layar |
| Tipografi | Kontras berat tinggi (Black 900 vs Regular 400) | Semua sedang (500–600) |
| Gerak | Sangat sedikit, hanya hover & transisi panel | Stagger, parallax, marquee |

Tiga kata kunci: **jelas, cepat dipindai, jujur soal isi.**

---

## 2. Warna

Semua warna didefinisikan di `src/index.css` blok `@theme`. Jangan tulis hex arbitrary
(`bg-[#xxxxxx]`) di komponen. Satu-satunya pengecualian: warna kategori yang di-inject lewat
`style={{ backgroundColor: categoryColor(id) }}` karena nilainya dinamis dari data.

### 2.1 Chrome & permukaan

| Token | Hex | Dipakai untuk |
|---|---|---|
| `ink-900` | `#151914` | Teks utama, `btn-primary`, hero band, footer, header logo mark |
| `ink-700` | `#30362C` | Teks paragraf sekunder, ikon aktif |
| `ink-500` | `#5C6256` | Teks pendukung, deskripsi |
| `ink-400` | `#808573` | Teks paling pudar, placeholder, caption |
| `ink-300` | `#A8AC9C` | Dot inaktif, indikator mati |
| `ink-200` | `#D0D3C6` | Drag handle, garis pemisah tebal |
| `ink-100` | `#E9EBE3` | Isian netral paling terang |
| `cream-50` | `#FBF7EE` | Latar halaman, isian input di chrome terang |
| `cream-100` | `#F2EBD9` | Latar peta kosong, panel sekunder |
| `cream-200` | `#E4D9C1` | Garis pemisah lembut |
| `cream-300` | `#CFC0A3` | Garis pemisah tegas di area krem |

`body` memakai gradien vertikal sangat halus `#FBF7EE → #F6F0E3` dengan `background-attachment: fixed`.
Ini satu-satunya gradien latar yang diizinkan.

### 2.2 Brand & aksen

| Token | Hex | Dipakai untuk |
|---|---|---|
| `brand-500` | `#1F334F` | Hover state `btn-primary`, meja kios di pin, ring lokasi user |
| `brand-600` | `#1A2A42` | Varian gelap brand |
| `brand-700` | `#132033` | Varian paling gelap brand |
| `accent-400` | `#F1B23A` | Aksen utama, logo mark, bintang rating, bookmark aktif |
| `accent-500` | `#E39B17` | Hover aksen, ikon pin di teks |
| `accent-600` | `#C07F0F` | Teks aksen di atas latar terang (kontras AA) |

Catatan kontras: **jangan** pakai `accent-400` untuk teks di atas putih atau krem — gagal AA.
Untuk teks aksen di latar terang selalu pakai `accent-600`. `accent-400` hanya untuk fill,
ikon besar, atau teks di atas `ink-900`.

### 2.3 WhatsApp

| Token | Hex | Dipakai untuk |
|---|---|---|
| `wa-500` | `#1F8A5B` | `btn-wa`, dot status buka, kategori Jasa |
| `wa-600` | `#166E48` | Hover `btn-wa`, teks status buka di latar terang |
| `wa-700` | `#105638` | Varian tekan |

WhatsApp punya warna sendiri dan **tidak boleh** dipakai untuk aksi non-WhatsApp.
Kalau tombol berwarna `wa-500`, tombol itu wajib membuka `wa.me`.

### 2.4 Kategori

| Kategori | Token | Hex |
|---|---|---|
| Kuliner | `cabai-500` | `#D1432B` |
| Kerajinan & Kriya | `kerajinan-500` | `#D1772F` |
| Fashion & Busana | `fashion-500` | `#824FA5` |
| Jasa & Servis | `wa-500` | `#1F8A5B` |
| Pertanian & Agro | `agro-500` | `#78893F` |

Sumber kebenaran warna kategori ada di **dua** tempat yang wajib sinkron:
- `src/lib/format.ts` → `CATEGORY_COLORS`, `categoryColor()`, `categoryTextColor()`
- `src/components/map/UmkmMap.tsx` → `CATEGORY_PIN_COLOR`

Menambah kategori berarti mengubah keduanya plus `CATEGORY_LABELS` dan `CategoryIcon.tsx`.

### 2.5 Aturan pemakaian warna

1. Satu layar hanya boleh punya **satu** area berwarna kategori yang menonjol. Di grid kartu,
   itu badge kategori. Di peta, itu pin. Jangan mewarnai judul, tombol, dan border sekaligus
   dengan warna kategori.
2. Tombol aksi utama selalu netral (`ink-900`) atau hijau WhatsApp. Warna kategori tidak
   pernah jadi warna tombol.
3. Warna kategori dengan opasitas rendah (`${color}14` – `${color}20`) dipakai untuk latar
   placeholder dan isian ikon, bukan untuk blok besar.

---

## 3. Tipografi

Tiga keluarga, dimuat via Google Fonts di `index.html`.

| Peran | Class | Font | Berat yang dipakai |
|---|---|---|---|
| Display | `font-display` | Plus Jakarta Sans | 700, 800, 900 |
| Body | `font-sans` (default) | Inter | 400, 500, 600 |
| Data | `font-mono` | JetBrains Mono | 400, 600, 700 |

### 3.1 Skala judul

| Konteks | Kelas |
|---|---|
| Hero H1 | `font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05]` |
| Judul halaman | `font-display font-black text-3xl sm:text-4xl tracking-tight` |
| Judul section | `font-display font-black text-2xl sm:text-3xl tracking-tight` |
| Judul panel/kartu besar | `font-display font-bold text-lg` |
| Nama usaha di kartu | `font-display font-extrabold text-[15px] sm:text-base leading-tight` |
| Nama usaha di list padat | `font-display font-bold text-xs leading-tight` |

Global: `h1`–`h6` mendapat `letter-spacing: -0.025em` dan `text-wrap: balance` dari `@layer base`.

### 3.2 Kapan pakai mono

`font-mono` hanya untuk **data yang dibaca sebagai angka atau kode**:
harga, rating, jumlah ulasan, jarak, jam, koordinat, nomor telepon, jumlah item, label eyebrow.

Jangan pakai mono untuk kalimat, deskripsi usaha, atau isi tombol.
Angka dalam tabel/metrik tambahkan `tabular-nums` supaya kolomnya rata.

### 3.3 Ukuran teks kecil

Banyak UI memakai ukuran non-standar via arbitrary value karena skala Tailwind default terlalu
melompat di area kecil. Yang dipakai konsisten:

- `text-[13px]` — paragraf di panel padat
- `text-[12.5px]` — deskripsi di kartu
- `text-[11px]` — metadata, caption, label filter
- `text-[10px]` — badge kategori, eyebrow
- `text-[9px]` — badge di dalam badge (produk unggulan di list padat)

---

## 4. Bentuk & radius

Sistem ini **tidak memakai bentuk pil/kapsul** (`rounded-full` pada elemen berteks).
Ini keputusan sadar: kapsul membuat UI terasa lunak dan generik. Yang dipakai:

| Radius | Nilai | Dipakai untuk |
|---|---|---|
| `rounded-md` | 6px | Badge kategori, badge produk, tombol filter, toggle status |
| `rounded-lg` | 8px | Tombol, input, kartu kecil, counter mengambang |
| `rounded-xl` | 12px | Panel dalam, gambar di panel, tombol CTA besar, legend peta |
| `rounded-2xl` | 16px | Kartu utama, panel form, wadah peta, modal (desktop) |
| `rounded-3xl` | 24px | CTA band besar, bottom sheet mobile (atas saja) |

### 4.1 Pengecualian `rounded-full` yang diizinkan

`rounded-full` hanya boleh untuk elemen yang memang lingkaran, bukan label berbentuk kapsul:

- Tombol ikon persegi (share, bookmark, tutup) — `w-9 h-9 rounded-full`
- `CategoryIcon` — lingkaran adalah identitas komponen itu
- Dot indikator warna kategori di legend peta
- Titik jangkar pin (`.stall-pin-anchor`)
- Ring lokasi pengguna di peta
- Drag handle bottom sheet
- Lingkaran ikon di `EmptyState` dan halaman sukses

Dot status **inline** (di kartu, list peta) justru memakai kotak kecil tanpa radius
(`w-1.5 h-1.5` polos) supaya konsisten dengan bahasa bentuk yang tegas.

---

## 5. Bayangan

Bayangan memakai warna tinta `rgba(21,25,20,…)`, bukan hitam murni, supaya menyatu dengan
latar kertas.

| Konteks | Nilai |
|---|---|
| Kartu diam | `0 1px 2px rgba(21,25,20,0.04), 0 4px 12px -6px rgba(21,25,20,0.08)` |
| Kartu hover | `0 2px 4px rgba(21,25,20,0.05), 0 12px 28px -10px rgba(21,25,20,0.15)` |
| Panel mengambang di atas hero | `0 20px 60px -20px rgba(21,25,20,0.25)` |
| Modal | `shadow-2xl` |
| Footer CTA sticky | `0 -10px 30px -12px rgba(21,25,20,0.15)` |
| Tombol primary | inset highlight + `0 3px 8px -3px rgba(21,25,20,0.3)` |

Tombol punya inset highlight tipis di baris pertama shadow
(`0 1px 0 rgba(255,255,255,0.1) inset`) untuk memberi kesan permukaan, bukan flat.

---

## 6. Class komponen (`@layer components`)

Semua ada di `src/index.css`. Pakai ini sebelum menulis utility berulang.

### 6.1 Layout

```
.container-site   max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### 6.2 Tombol

Dasar `.btn` memberi: inline-flex, gap 1.5, padding 3.5/2, `text-[13px]`, `font-semibold`,
`rounded-lg`, transisi 200ms, `focus-visible:outline-2`, `cursor-pointer`, `select-none`.

| Class | Tampilan | Kapan dipakai |
|---|---|---|
| `.btn-primary` | Isian `ink-900`, teks `cream-50`, hover `brand-500` | Aksi utama non-WhatsApp: Cari, Daftarkan, Detail |
| `.btn-wa` | Isian `wa-500`, teks putih | **Hanya** untuk aksi yang membuka WhatsApp |
| `.btn-accent` | Isian `accent-400`, teks `ink-900`, bold | CTA di atas latar gelap (`ink-900`) |
| `.btn-outline` | Putih, border `ink-900/10` | Aksi sekunder |
| `.btn-ghost` | Transparan, hover `ink-900/5` | Aksi tersier, reset, batal |

Semua tombol punya `active:translate-y-px` untuk umpan balik tekan.

Override ukuran memakai `!` modifier, contoh: `btn btn-wa !py-3 !text-sm rounded-xl`.

### 6.3 Input

```
.field   w-full, border ink-900/10, bg putih, rounded-lg, px-3.5 py-2.5,
         text-sm, focus:ring-2 ring-ink-900, shadow-sm
```

Label di atas input memakai pola `text-[11px] font-bold text-ink-700 uppercase tracking-tight`
(lihat helper `<Label>` di `RegisterUmkmView.tsx`). Tanda wajib: `<span className="text-cabai-500">*</span>`.

### 6.4 Kartu

```
.card   bg putih, rounded-2xl, border ink-900/[0.07],
        shadow berlapis, hover:-translate-y-0.5, transition 300ms
```

### 6.5 Label & badge

```
.label-caption     text-[10px] font-mono font-bold text-ink-400 uppercase tracking-[0.14em]
.category-badge    inline-flex, px-2 py-1, rounded-md, text-[10px] font-mono font-bold tracking-wider
.stamp-verified    border dashed wa-500/40, bg wa-500/[0.07], text-wa-600, rounded (bukan full)
.eyebrow           text-[11px] font-mono font-bold text-ink-500 uppercase tracking-[0.18em]
                   + garis 14px di kiri via ::before
.eyebrow-accent    modifier warna accent-600 untuk .eyebrow
.divider-dot       w-1 h-1 bg-ink-300 (kotak, bukan lingkaran)
```

`.eyebrow` adalah pengganti resmi untuk "chip label section". Setiap section yang butuh
label kecil di atas judul memakai ini, bukan kotak berwarna.

`.stamp-verified` sengaja memakai border putus-putus untuk meniru cap/stempel — ini rooted
pada praktik nyata verifikasi usaha di Indonesia, bukan hiasan.

### 6.6 Scroll

```
.custom-scroll   scrollbar 8px, thumb rgba(21,25,20,0.15), track transparan
```

Dipakai di panel yang bisa di-scroll: sidebar peta, isi modal, bottom sheet.

---

## 7. Pin peta (identitas produk)

Pin kios adalah **signature visual** UMKM-Go. Jangan diganti bentuk teardrop dengan alasan apa pun.

### 7.1 Anatomi

Dibuat oleh `makeStallPinHtml(color, selected, label)` di `UmkmMap.tsx`, viewBox `0 0 40 54`:

1. **Halo putih** — jalur atap yang sedikit lebih besar di belakang, memberi separasi dari peta
2. **Kanopi tenda** — diisi warna kategori, stroke `#151914` 1.3px
3. **Tepi bergelombang** — enam lengkung, meniru rumbai tenda pasar
4. **Jahitan kanopi** — lima garis putih `opacity 0.55`
5. **Badan kios** — `#FBF7EE` dengan stroke tinta
6. **Etalase** — kotak warna kategori `opacity 0.18` dengan stroke penuh
7. **Meja kasir** — balok `brand-500`
8. **Tiang runcing** — segitiga tinta ke bawah
9. **Titik jangkar** — `.stall-pin-anchor`, jadi emas + ring brand saat terpilih

### 7.2 Ukuran & state

| State | Skala | iconSize | Transform |
|---|---|---|---|
| Normal | 1.0 | 40×54 | `translate(-50%,-100%)` |
| Hover | 1.08 | — | `translate(-50%,-106%) scale(1.08)` |
| Terpilih (`selected`) | 1.2 | 48×64 | `translate(-50%,-112%) scale(1.18)` |

Parameter `label` memunculkan tag tinta+emas di bawah pin. Saat ini hanya dipakai untuk pin
"BARU" di halaman pendaftaran.

### 7.3 Tile & kontrol

- Tile: **CartoDB Voyager** `{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`
- Latar container peta: `cream-100` (terlihat saat tile belum termuat)
- `zoomSnap: 0.5`, `zoomDelta: 0.5` untuk zoom yang lebih halus
- Kontrol zoom: kotak 32px, `rounded-10px`, border tinta, shadow tipis
- Atribusi: latar putih 85% + `backdrop-filter: blur(8px)`, mono 10px
- Popup: `rounded-14px`, tanpa tombol tutup, shadow dalam

### 7.4 Lokasi pengguna

Titik `brand-500` 16px dengan border putih 3px, dikelilingi cincin `ping-user` 1.8s.
Peta **wajib** tetap render penuh kalau `navigator.geolocation` ditolak — hanya markernya
yang tidak muncul.

---

## 8. Pola UI

### 8.1 Kartu UMKM (`UmkmCard.tsx`)

Susunan dari atas:

```
┌─────────────────────────────┐
│ [Kategori]        (bookmark)│  ← badge rounded-md kiri, tombol bulat kanan
│                             │
│        gambar 4:3           │
│                             │
│ ▪ BUKA SEKARANG    📍 1.2 km│  ← teks mono putih di atas scrim gradien
├─────────────────────────────┤
│ ⌐Terverifikasi⌐    ★ 4.8(342)│
│ Nama Usaha                  │  ← display extrabold
│ 📍 Kota · Provinsi          │
│ Deskripsi dua baris…        │
├─────────────────────────────┤
│ HARGA              [📍][Chat]│  ← WhatsApp di kanan-bawah (wajib)
│ Rp 28.000 - 45.000          │
└─────────────────────────────┘
```

Aturan yang tidak boleh berubah: badge kategori kiri-atas, tombol WhatsApp kanan-bawah,
`loading="lazy"` pada gambar, fallback placeholder = warna kategori + ikon `Store`.

Hover: gambar `scale-[1.04]` 500ms, kartu naik `-translate-y-0.5`, nama berubah ke `brand-500`.

### 8.2 Tab kategori

Filter kategori memakai **tab bar dengan garis bawah**, bukan chip:

```jsx
<nav className="flex items-center gap-1 border-b border-ink-900/5">
  <button
    className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 -mb-px
                ${aktif ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'}`}
    style={{ borderColor: aktif ? warnaKategori : 'transparent' }}
  >
    <span className="w-1.5 h-1.5" style={{ backgroundColor: aktif ? warnaKategori : '#A8AC9C' }} />
    Kuliner
  </button>
</nav>
```

Warna kategori muncul sebagai **garis bawah + dot kotak**, tidak sebagai isian latar.

### 8.3 Toggle filter

Filter boolean (Terverifikasi, Buka sekarang) memakai kotak `rounded-md` dengan latar
opasitas rendah + border tipis saat aktif — bukan isian solid:

```
aktif    : bg-wa-500/10 text-wa-600 border border-wa-500/30
non-aktif: bg-cream-50 text-ink-500 border border-transparent
```

### 8.4 Hero

Latar `ink-900` polos dengan satu garis gradien emas setebal 1px di tepi atas.
Tidak ada blob blur, tidak ada pola titik. Judul memakai pemecahan baris manual dengan
`<span className="block text-accent-400">` untuk baris kedua.

Search bar hero adalah kartu putih `rounded-2xl` `shadow-2xl` berisi tiga zona:
input teks | pemisah vertikal | select kota | tombol.

### 8.5 Bottom sheet mobile (peta)

Di bawah `md`, panel detail peta menjadi bottom sheet, **bukan** modal penuh:

- Tertutup: `max-h-[220px]` — cukup untuk nama, harga, status, dua tombol
- Terbuka: `max-h-[85vh]`
- Drag handle `w-10 h-1 rounded-full bg-ink-200` di tengah atas
- Peta tetap terlihat dan bisa digeser di area sisanya

### 8.6 Modal detail

- Mobile: menempel bawah, `rounded-t-3xl`
- Desktop: tengah, `rounded-3xl`, `max-w-3xl`
- Cover foto 224–256px dengan gradien tinta dari bawah; judul, badge kategori, dan lokasi
  ditempatkan di atas foto
- Tombol share/bookmark/tutup: lingkaran 36px putih di kanan atas foto
- Footer sticky berisi tombol Petunjuk arah + Hubungi via WhatsApp

### 8.7 Metrik dashboard

Kartu metrik: ikon 40px `rounded-xl` dengan latar warna tema 10–15%, delta di kanan atas
dengan ikon `TrendingUp`, label `.label-caption`, angka `font-mono font-black text-2xl`.

### 8.8 State kosong (`EmptyState.tsx`)

Selalu punya judul yang menjelaskan situasi + deskripsi yang mengarahkan tindakan +
satu atau dua tombol. Dilarang pesan sistem generik seperti "No results found".

---

## 9. Ikon

Hanya `lucide-react`. Dilarang emoji sebagai ikon di UI produksi.

| Ukuran | Kelas | Konteks |
|---|---|---|
| 12px | `w-3 h-3` | Di dalam badge dan teks kecil |
| 14px | `w-3.5 h-3.5` | Di dalam tombol kecil, metadata |
| 16px | `w-4 h-4` | Tombol standar, item daftar |
| 20px | `w-5 h-5` | Ikon navigasi, metrik |
| 24px+ | `w-6 h-6` ke atas | Ikon fitur, state kosong |

Pemetaan ikon kategori (di `CategoryIcon.tsx`):
Kuliner → `UtensilsCrossed`, Kerajinan → `Sparkles`, Fashion → `Shirt`,
Jasa → `Wrench`, Pertanian → `Sprout`, fallback → `Store`.

---

## 10. Gerak

Gerak dipakai sangat terbatas.

| Elemen | Efek | Durasi |
|---|---|---|
| Tombol | Perubahan warna + `translate-y-px` saat ditekan | 200ms |
| Kartu | Naik 2px + shadow membesar | 300ms |
| Gambar kartu | `scale-[1.04]` | 500ms `ease-out` |
| Pin peta | Membesar saat hover/terpilih | 200ms `cubic-bezier(0.4,0,0.2,1)` |
| Bottom sheet | Perubahan `max-h` | 300ms |
| Peta pindah titik | `flyTo` | 500ms |
| Titik lokasi user | `ping-user` berulang | 1.8s |

Yang dilarang: animasi masuk bertahap (stagger) pada daftar, parallax, teks berjalan,
elemen yang bergerak tanpa dipicu aksi pengguna.

---

## 11. Responsif

Titik uji: **360px**, **768px**, **≥1280px**.

| Area | Mobile | Tablet | Desktop |
|---|---|---|---|
| Navigasi | Menu tarik-turun | Menu tarik-turun | Baris penuh + pencarian |
| Grid kartu | 1 kolom | 2 kolom | 3 kolom |
| Peta | Layar penuh + bottom sheet | Peta + bottom sheet | Peta + sidebar 380px |
| Form daftar | Satu kolom, pratinjau di bawah | Satu kolom | 7/5 dengan pratinjau lengket |
| Dashboard metrik | Tumpuk | 3 kolom | 3 kolom |
| Footer | Tumpuk | 2 kolom | 12 kolom (4/2/2/3) |

Tinggi area peta: `calc(100vh - 64px)` dengan `min-h-[560px]`.
Footer disembunyikan di halaman peta agar peta benar-benar penuh.

---

## 12. Aksesibilitas

1. Semua elemen interaktif punya `focus-visible:outline-2 outline-offset-2` (sudah di `.btn`).
   Jangan hapus saat membuat komponen baru.
2. Tombol khusus ikon wajib punya `aria-label` atau `title`.
3. Kombinasi yang sudah diverifikasi lolos AA di latar terang:
   `ink-900`, `ink-700`, `ink-500`, `wa-600`, `accent-600`, `cabai-500`, `fashion-500`.
   Yang **gagal** dan hanya boleh untuk teks non-esensial: `ink-400` di atas `cream-100`,
   `accent-400` di atas putih.
4. Teks di atas foto selalu di atas scrim gradien, tidak pernah langsung di atas gambar.
5. Semua `<img>` punya `alt` berisi nama usaha dan `loading="lazy"`.
6. Peta tetap berfungsi tanpa izin geolokasi.

---

## 13. Bahasa

Bahasa Indonesia, kalimat aktif, tanpa jargon teknis.

| Pakai | Jangan |
|---|---|
| Hubungi via WhatsApp | Kirim Pesan / Submit |
| Cari Lapak | Search |
| Daftarkan Lapak Sekarang | Register |
| Simpan | Bookmark |
| Buka Sekarang / Sudah Tutup | Open / Closed |
| Petunjuk Arah | Directions |
| Tidak ada lapak yang cocok | No results found |

Istilah domain yang konsisten dipakai: **lapak** (unit usaha), **kios** (titik fisik di peta),
**pemilik** (pengguna pelaku usaha), **warga/pelanggan** (pengguna pencari).

Pesan pembuka WhatsApp dibangkitkan `makeWhatsAppLink()` dan selalu menyebut nama usaha
serta asal tautan, supaya pemilik tahu konteks pesan masuk.

---

## 14. Struktur berkas

```
src/
├── index.css                        Token @theme, @layer base, @layer components, gaya Leaflet
├── App.tsx                          Router tab, state global, localStorage
├── types/umkm.ts                    Tipe UmkmItem, CategoryId, FeaturedProduct, ViewTab
├── data/umkmData.ts                 Data awal + daftar kota
├── lib/
│   ├── format.ts                    Warna kategori, format telepon/harga/jarak/jam, tautan WA
│   └── format.js                    Re-export untuk pemanggil JS
├── components/
│   ├── UmkmCard.tsx / .jsx          Kartu usaha
│   ├── ui/
│   │   ├── CategoryIcon.tsx / .jsx  Ikon bulat kategori
│   │   └── EmptyState.tsx / .jsx    State kosong
│   ├── map/
│   │   └── UmkmMap.tsx / .jsx       Satu-satunya instance Leaflet + makeStallPinHtml
│   └── layout/
│       ├── Navbar.tsx               Header kaca
│       └── Footer.tsx               Footer tinta
└── views/
    ├── HomeView.tsx                 Hero, kategori, sorotan peta, unggulan, CTA
    ├── MapPageView.tsx              Ruang kerja peta + sidebar/bottom sheet
    ├── ExploreView.tsx              Direktori + filter
    ├── UmkmDetailModal.tsx          Profil lengkap
    ├── RegisterUmkmView.tsx         Formulir 3 langkah + pratinjau langsung
    ├── DashboardView.tsx            Metrik, status, kelola produk
    └── SavedView.tsx                Lapak tersimpan
```

Berkas `.jsx` yang ada hanya melakukan `export * from './*.tsx'` — untuk kompatibilitas
dengan pemanggil JavaScript. Jangan menaruh logika di sana.

---

## 15. Daftar periksa sebelum merge

- [ ] Tidak ada `bg-[#...]` baru di komponen; warna baru masuk ke `@theme` dulu
- [ ] Tidak ada `rounded-full` pada elemen berteks (kapsul)
- [ ] Badge kategori memakai `.category-badge`, bukan utility manual
- [ ] Label section memakai `.eyebrow`, bukan kotak berwarna
- [ ] Angka memakai `font-mono`; kalimat tidak
- [ ] Tombol hijau `wa-500` benar-benar membuka `wa.me`
- [ ] Peta baru memakai `<UmkmMap>`, bukan `MapContainer`/`L.map` baru
- [ ] Pin tetap kios, bukan teardrop
- [ ] `<img>` punya `alt` + `loading="lazy"` + fallback kategori
- [ ] Semua interaktif punya `focus-visible`
- [ ] Teks tombol dan label berbahasa Indonesia aktif
- [ ] Diuji di 360px, 768px, dan desktop lebar
- [ ] Tidak ada emoji sebagai pengganti ikon
- [ ] Tidak ada animasi stagger atau blob blur dekoratif
- [ ] `npm run build` lolos tanpa error
