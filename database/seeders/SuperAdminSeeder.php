<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'radencakstudio@gmail.com'],
            [
                'name' => 'RADEN',
                'password' => Hash::make('Raden1234'),
                'role' => 'super_admin',
                'title' => '👑 SUPER ADMIN',
                'level' => 99,
                'exp' => 9999,
                'avatar' => [
                    'gender' => 'male',
                    'skinColor' => '#fed7aa',
                    'shirtColor' => '#f59e0b',
                    'pantsColor' => '#0f172a',
                    'hatType' => 'crown',
                ],
            ]
        );

        $this->command->info("Super Admin account seeded: {$user->email} ({$user->name}) [ROLE: {$user->role}]");
    }
}
