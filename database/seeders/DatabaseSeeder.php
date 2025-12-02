<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'affiliate']);
        Role::firstOrCreate(['name' => 'mentor']);
        Role::firstOrCreate(['name' => 'user']);

        $admin = User::factory()->create([
            'name' => 'Admin SkillGrow',
            'email' => 'skillgrow.id@gmail.com',
            'phone_number' => '085184012430',
            'bio' => 'Admin SkillGrow',
            'password' => bcrypt('Batu2025@'),
        ]);

        $adminAffiliate = User::factory()->create([
            'name' => 'SkillGrow Affiliate',
            'email' => 'smartarthamuda@gmail.com',
            'phone_number' => '085184012430',
            'bio' => "Affiliate SkillGrow",
            'password' => bcrypt('085184012430'),
            'affiliate_code' => 'SGW2025',
            'affiliate_status' => 'Active',
            'commission' => 10,
        ]);

        $admin->assignRole('admin');
        $adminAffiliate->assignRole('affiliate');

        $this->call([
            ToolSeeder::class,
            CategorySeeder::class,
        ]);
    }
}
