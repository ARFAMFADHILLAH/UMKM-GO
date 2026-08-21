<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Umkm;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UmkmSeeder extends Seeder
{
    private const CATEGORY_COLORS = [
        'Kuliner' => [230, 126, 34],
        'Kerajinan Tangan' => [22, 160, 133],
        'Fashion' => [142, 68, 173],
        'Pertanian & Perkebunan' => [39, 174, 96],
        'Jasa & Servis' => [41, 128, 185],
    ];

    public function run(): void
    {
        $demo = User::factory()->create([
            'name' => 'Adam Prasetyo',
            'email' => 'tempemendoanmasadam@gmail.com',
            'password' => 'tempemendo@nmas@d4m26',
        ]);

        $partner = User::factory()->create([
            'name' => 'Ratna Wijaya',
            'email' => 'ratnawijaya@gmail.com',
        ]);

        $categories = Category::pluck('id', 'name');

        // Bersihkan gambar lama supaya re-seed tidak meninggalkan file yatim
        Storage::disk('public')->deleteDirectory('umkms');
        Storage::disk('public')->makeDirectory('umkms');

        foreach ($this->umkmData() as $item) {
            $slug = Str::slug($item['name']);
            $imagePath = $this->generateCoverImage($item['name'], $item['category'], $slug);

            Umkm::create([
                'user_id' => $item['owner'] === 'demo' ? $demo->id : $partner->id,
                'category_id' => $categories[$item['category']],
                'name' => $item['name'],
                'slug' => $slug,
                'description' => $item['description'],
                'address' => $item['address'],
                'province' => $item['province'],
                'city' => $item['city'],
                'phone_whatsapp' => $item['phone'],
                'instagram' => $item['instagram'],
                'website_url' => $item['website'],
                'image_cover' => $imagePath,
                'latitude' => $item['latitude'],
                'longitude' => $item['longitude'],
                'is_verified' => true,
            ]);
        }
    }

    private function umkmData(): array
    {
        return [
            [
                'owner' => 'demo', 'category' => 'Kuliner',
                'name' => 'Tempe Mendoan Mas Adam',
                'description' => 'Mendoan tempe goreng tepung renyah khas Banyumas, digoreng dadakan setiap pesanan. Melayani pemesanan ritel dan grosir untuk kafe serta warung di sekitar Malang.',
                'address' => 'Jl. Kawi Atas No. 24, Lowokwaru',
                'province' => 'Jawa Timur', 'city' => 'Kota Malang',
                'phone' => '6281234567890', 'instagram' => 'tempemendoan.masadam', 'website' => null,
                'latitude' => -7.9553, 'longitude' => 112.6210,
            ],
            [
                'owner' => 'demo', 'category' => 'Pertanian & Perkebunan',
                'name' => 'Keripik Apel Maja House',
                'description' => 'Olahan apel khas Kota Batu: keripik apel manis renyah tanpa pengawet dalam kemasan vacuum 250 gram, tersedia rasa original dan kayu manis.',
                'address' => 'Jl. Raya Selecta No. 8, Bumiaji',
                'province' => 'Jawa Timur', 'city' => 'Kota Batu',
                'phone' => '6281357224680', 'instagram' => 'keripikapel.majahouse', 'website' => null,
                'latitude' => -7.8712, 'longitude' => 112.5189,
            ],
            [
                'owner' => 'demo', 'category' => 'Fashion',
                'name' => 'Tas Kulit Rajawali Garut',
                'description' => 'Tas dan dompet kulit sapi asli Garut yang dibuat tangan oleh pengrajin berpengalaman sejak 2009. Menerima custom ukiran inisial gratis.',
                'address' => 'Jl. Cikapayang No. 17, Coblong',
                'province' => 'Jawa Barat', 'city' => 'Kota Bandung',
                'phone' => '6281229834157', 'instagram' => 'rajawalileather', 'website' => 'https://rajawalileather.id',
                'latitude' => -6.8915, 'longitude' => 107.6109,
            ],
            [
                'owner' => 'demo', 'category' => 'Fashion',
                'name' => 'Batik Lawas Kanaya',
                'description' => 'Batik cap motif klasik pesisir dengan pewarna alami, nyaman dipakai untuk acara formal maupun kasual. Tersedia kain dan panjang.',
                'address' => 'Jl. Pandanaran No. 88, Semarang Tengah',
                'province' => 'Jawa Tengah', 'city' => 'Kota Semarang',
                'phone' => '6281392654018', 'instagram' => 'batiklawas.kanaya', 'website' => null,
                'latitude' => -6.9740, 'longitude' => 110.4252,
            ],
            [
                'owner' => 'demo', 'category' => 'Kerajinan Tangan',
                'name' => 'Perak Kotagede Langgeng',
                'description' => 'Perhiasan dan suvenir perak murni 925 buatan pengrajin Kotagede. Menerima pesanan custom ukiran nama untuk hampers dan pernikahan.',
                'address' => 'Jl. Kemasan No. 12, Kotagede',
                'province' => 'Daerah Istimewa Yogyakarta', 'city' => 'Yogyakarta',
                'phone' => '6282745123980', 'instagram' => 'peraklanggeng', 'website' => 'https://peraklanggeng.com',
                'latitude' => -7.8238, 'longitude' => 110.4089,
            ],
            [
                'owner' => 'demo', 'category' => 'Fashion',
                'name' => 'Kain Endek Dewata Ayu',
                'description' => 'Kain endek tenun Bali dengan motif kontemporer, pas untuk seragam kantor, kondangan, maupun suvenir. Bisa pesan warna sesuai permintaan.',
                'address' => 'Jl. Teuku Umar No. 210, Denpasar Barat',
                'province' => 'Bali', 'city' => 'Kota Denpasar',
                'phone' => '6281916447205', 'instagram' => 'endek.dewataayu', 'website' => null,
                'latitude' => -8.6589, 'longitude' => 115.2087,
            ],
            [
                'owner' => 'demo', 'category' => 'Kuliner',
                'name' => 'Bika Ambon Delima Gold',
                'description' => 'Bika ambon asli Medan berserat madu lembut, awet 3 hari tanpa pengawet. Tersedia pengiriman luar kota dengan packing aman.',
                'address' => 'Jl. Gatot Subroto Km 5, Medan Denai',
                'province' => 'Sumatera Utara', 'city' => 'Kota Medan',
                'phone' => '6281267439021', 'instagram' => 'bikaambon.delimagold', 'website' => null,
                'latitude' => 3.6205, 'longitude' => 98.6781,
            ],
            [
                'owner' => 'demo', 'category' => 'Kerajinan Tangan',
                'name' => 'Songket Tenun Sriwijaya',
                'description' => 'Songket Palembang motif lepus juntai, ditenun tangan dengan benang emas. Cocok untuk busana pengantin dan acara adat.',
                'address' => 'Jl. Ki Gede Ing Suro No. 5, Ilir Barat I',
                'province' => 'Sumatera Selatan', 'city' => 'Kota Palembang',
                'phone' => '6281377894562', 'instagram' => 'songket.sriwijaya', 'website' => null,
                'latitude' => -2.9867, 'longitude' => 104.7636,
            ],
            [
                'owner' => 'demo', 'category' => 'Jasa & Servis',
                'name' => 'Servis Elektronik Teknik Jaya',
                'description' => 'Jasa servis TV, mesin cuci, dan kulkas dengan teknisi bersertifikat. Gratis pengecekan unit untuk area Makassar dan sekitarnya.',
                'address' => 'Jl. Boulevard No. 45, Panakkukang',
                'province' => 'Sulawesi Selatan', 'city' => 'Kota Makassar',
                'phone' => '6281140298765', 'instagram' => 'teknikjaya.servis', 'website' => null,
                'latitude' => -5.1608, 'longitude' => 119.4281,
            ],
            [
                'owner' => 'demo', 'category' => 'Pertanian & Perkebunan',
                'name' => 'Robusta Bumi Kedaton',
                'description' => 'Biji kopi robusta Lampung grade satu dari kebun sendiri di Way Krui, tersedia proses honey dan natural dengan roasting sesuai pesanan.',
                'address' => 'Jl. Wolter Monginsidi No. 77, Telukbetung Selatan',
                'province' => 'Lampung', 'city' => 'Bandar Lampung',
                'phone' => '6281592087743', 'instagram' => 'robusta.bumikedaton', 'website' => 'https://bumikedatoncoffee.id',
                'latitude' => -5.4418, 'longitude' => 105.2607,
            ],
            [
                'owner' => 'partner', 'category' => 'Kuliner',
                'name' => 'Rendang Pariangan',
                'description' => 'Rendang daging kering asli Minang dengan resep masakan rumahan, tahan hingga sebulan tanpa pengawet. Level pedas bisa disesuaikan.',
                'address' => 'Jl. Khatib Sulaiman No. 31, Padang Barat',
                'province' => 'Sumatera Barat', 'city' => 'Kota Padang',
                'phone' => '6281753098241', 'instagram' => 'rendang.pariangan', 'website' => null,
                'latitude' => -0.9520, 'longitude' => 100.3540,
            ],
            [
                'owner' => 'partner', 'category' => 'Kuliner',
                'name' => 'Lontong Balap Pak Gendut',
                'description' => 'Lontong balap legendaris dengan lentho goreng dan kuah kecambah, resep turun-temurun sejak 1985. Buka pukul 08.00-16.00 WIB.',
                'address' => 'Jl. Prof. Dr. Moestopo No. 3, Genteng',
                'province' => 'Jawa Timur', 'city' => 'Surabaya',
                'phone' => '6285641029738', 'instagram' => 'lontongbalap.pakgendut', 'website' => null,
                'latitude' => -7.2649, 'longitude' => 112.7428,
            ],
            [
                'owner' => 'partner', 'category' => 'Kerajinan Tangan',
                'name' => 'Kerajinan Rotan Ulin Borneo',
                'description' => 'Kerajinan rotan dan kayu ulin: kursi, rak, dan dekorasi ruangan buatan pengrajin Kalimantan. Desain bisa custom sesuai kebutuhan.',
                'address' => 'Jl. MT Haryono No. 9, Balikpapan Tengah',
                'province' => 'Kalimantan Timur', 'city' => 'Balikpapan',
                'phone' => '6281258764309', 'instagram' => 'ulinborneocraft', 'website' => null,
                'latitude' => -1.2455, 'longitude' => 116.8398,
            ],
            [
                'owner' => 'partner', 'category' => 'Kuliner',
                'name' => 'Kue Lapis Legit Bundarina',
                'description' => 'Lapis legit 33 lapis dengan rempah asli yang dipanggang manual. Cocok untuk hantaran, parsel, dan oleh-oleh khas Pontianak.',
                'address' => 'Jl. Gajah Mada No. 150, Pontianak Kota',
                'province' => 'Kalimantan Barat', 'city' => 'Kota Pontianak',
                'phone' => '6281369205874', 'instagram' => 'lapislegit.bundarina', 'website' => null,
                'latitude' => -0.0038, 'longitude' => 109.3345,
            ],
            [
                'owner' => 'partner', 'category' => 'Jasa & Servis',
                'name' => 'Manado Sejuk Servis AC',
                'description' => 'Cuci dan servis AC residensial serta kantor dengan teknisi berpengalaman. Bergaransi 30 hari, menerima panggilan luar jam kerja.',
                'address' => 'Jl. Sam Ratulangi No. 63, Wenang',
                'province' => 'Sulawesi Utara', 'city' => 'Kota Manado',
                'phone' => '6281540973628', 'instagram' => 'manadosejuk.ac', 'website' => null,
                'latitude' => 1.4852, 'longitude' => 124.8413,
            ],
        ];
    }

    /**
     * Generate gambar sampul placeholder (JPEG) memakai GD:
     * latar warna per kategori + nama usaha sebagai teks.
     * Mengembalikan path relatif untuk kolom image_cover.
     */
    private function generateCoverImage(string $title, string $category, string $slug): string
    {
        [$r, $g, $b] = self::CATEGORY_COLORS[$category] ?? [90, 90, 90];

        $width = 800;
        $height = 600;
        $image = imagecreatetruecolor($width, $height);

        $background = imagecolorallocate($image, $r, $g, $b);
        imagefilledrectangle($image, 0, 0, $width, $height, $background);

        // Pita bawah lebih gelap untuk caption kategori
        $shade = imagecolorallocate($image, (int) ($r * 0.72), (int) ($g * 0.72), (int) ($b * 0.72));
        imagefilledrectangle($image, 0, $height - 110, $width, $height, $shade);

        // Lingkaran aksen transparan di pojok kanan atas
        $accent = imagecolorallocatealpha($image, 255, 255, 255, 70);
        imagefilledellipse($image, $width - 80, 80, 220, 220, $accent);
        imagefilledellipse($image, $width - 170, 150, 110, 110, $accent);

        $white = imagecolorallocate($image, 255, 255, 255);
        $fontPath = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

        if (is_file($fontPath)) {
            $lines = $this->wrapTtfText($title, $fontPath, 44, $width - 120);
            $lineHeight = 58;
            $startY = ($height - 110 - count($lines) * $lineHeight) / 2 + 44;

            foreach ($lines as $index => $line) {
                imagettftext($image, 44, 0, 60, (int) ($startY + $index * $lineHeight), $white, $fontPath, $line);
            }

            imagettftext($image, 24, 0, 60, $height - 42, $white, $fontPath, strtoupper($category));
        } else {
            // Fallback: font bawaan GD (kecil, tapi tetap terbaca)
            $lines = $this->wrapPlainText($title, 68);
            $lineHeight = 22;
            $startY = max(60, (int) (($height - 110 - count($lines) * $lineHeight) / 2));

            foreach ($lines as $index => $line) {
                $x = (int) (($width - strlen($line) * 9) / 2);
                imagestring($image, 5, $x, $startY + $index * $lineHeight, $line, $white);
            }

            imagestring($image, 4, 60, $height - 50, strtoupper($category), $white);
        }

        $relativePath = "umkms/{$slug}.jpg";
        $absolutePath = Storage::disk('public')->path($relativePath);
        imagejpeg($image, $absolutePath, 85);
        imagedestroy($image);

        return $relativePath;
    }

    /** Bungkus teks menjadi beberapa baris mengikuti lebar maksimum (ukuran piksel). */
    private function wrapTtfText(string $text, string $font, int $size, int $maxWidth): array
    {
        $lines = [];
        $current = '';

        foreach (explode(' ', $text) as $word) {
            $candidate = $current === '' ? $word : "{$current} {$word}";
            $box = imagettfbbox($size, 0, $font, $candidate);
            $candidateWidth = abs($box[4] - $box[0]);

            if ($candidateWidth > $maxWidth && $current !== '') {
                $lines[] = $current;
                $current = $word;
            } else {
                $current = $candidate;
            }
        }

        if ($current !== '') {
            $lines[] = $current;
        }

        return $lines;
    }

    /** Fallback wrap berbasis perkiraan lebar karakter font 5 (±9px/karakter). */
    private function wrapPlainText(string $text, int $maxChars): array
    {
        $lines = [];
        $current = '';

        foreach (explode(' ', $text) as $word) {
            $candidate = $current === '' ? $word : "{$current} {$word}";

            if (strlen($candidate) > $maxChars && $current !== '') {
                $lines[] = $current;
                $current = $word;
            } else {
                $current = $candidate;
            }
        }

        if ($current !== '') {
            $lines[] = $current;
        }

        return $lines;
    }
}
