<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Akun admin demo (kredensial dikabarkan ke tim frontend)
        User::create([
            'name' => 'Admin UMKM-Go',
            'email' => 'admin@umkmgo.test',
            'password' => 'adminumkmgo123',
            'role' => 'admin',
        ]);

        $this->call([
            CategorySeeder::class,
            UmkmSeeder::class,
        ]);
    }
}
