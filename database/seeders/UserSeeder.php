<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "👥 Membuat users untuk Sudut Timur Coffee...\n";

        // Admin User
        User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Operator User
        User::firstOrCreate(
            ['email' => 'operator@operator.com'],
            [
                'name' => 'Operator Produksi',
                'password' => Hash::make('12345678'),
                'role' => 'operator',
                'email_verified_at' => now(),
            ]
        );

        // Manajer User
        User::firstOrCreate(
            ['email' => 'manajer@manajer.com'],
            [
                'name' => 'Manajer Operasional',
                'password' => Hash::make('12345678'),
                'role' => 'manager', // PERBAIKAN: Gunakan 'manager' bukan 'manajer'
                'email_verified_at' => now(),
            ]
        );

        // Tambahan: User lain untuk testing
        User::firstOrCreate(
            ['email' => 'produksi@suduттimur.com'],
            [
                'name' => 'Staff Produksi',
                'password' => Hash::make('12345678'),
                'role' => 'operator',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'qc@suduттimur.com'],
            [
                'name' => 'Quality Control',
                'password' => Hash::make('12345678'),
                'role' => 'operator',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'gudang@suduттimur.com'],
            [
                'name' => 'Staff Gudang',
                'password' => Hash::make('12345678'),
                'role' => 'operator',
                'email_verified_at' => now(),
            ]
        );

        $totalUsers = User::count();
        echo "✅ {$totalUsers} users berhasil dibuat!\n";

        echo "\n📋 DAFTAR USER LOGIN:\n";
        echo "👑 Admin: admin@admin.com | Password: 12345678\n";
        echo "⚙️  Operator: operator@operator.com | Password: 12345678\n";
        echo "📊 Manajer: manajer@manajer.com | Password: 12345678 | Role: manager\n";
        echo "🏭 Staff Produksi: produksi@suduттimur.com | Password: 12345678\n";
        echo "🔍 Quality Control: qc@suduттimur.com | Password: 12345678\n";
        echo "📦 Staff Gudang: gudang@suduттimur.com | Password: 12345678\n";
    }
}
