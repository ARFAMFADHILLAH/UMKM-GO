<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Category;
use App\Models\Umkm;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;


class UmkmSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Budi Mulya',
            'email' => 'budi@gmail.com',
        ]);

        $category = Category::first();

        Umkm::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'name' => 'Kripik Tempe Oemah',
            'slug' => Str::slug('Kripik Tempe Oemah'),
            'description' => 'Keripik tempe renyah khas buatan rumah dengan bumbu rempah pilihan tanpa pengawet.',
            'address' => 'Jl. Merdeka No. 45, Kecamatan Lowokwaru',
            'province' => 'Jawa Timur',
            'city' => 'Kota Malang',
            'phone_whatsapp' => '6281234567890',
            'instagram' => 'kripiktempe_oemah',
            'is_verified' => true,
        ]);
    }
}
