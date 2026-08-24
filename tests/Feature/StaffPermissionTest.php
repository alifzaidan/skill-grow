<?php

use App\Models\User;
use Database\Seeders\StaffPermissionSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->withoutVite();

    // Ensure roles and permissions exist
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'mentor', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'affiliate', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

    $this->seed(StaffPermissionSeeder::class);
});

test('staff user is redirected to admin dashboard on login', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');

    $response = $this->post('/login', [
        'email' => $staff->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));
});

test('admin can access staff management and create staff', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);

    $response = $this->get(route('staff.index'));
    $response->assertOk();

    $response = $this->post(route('staff.store'), [
        'name' => 'Staff Test',
        'email' => 'stafftest@example.com',
        'phone_number' => '081234567890',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'permissions' => ['courses.view', 'courses.manage'],
    ]);

    $response->assertRedirect(route('staff.index'));

    $createdStaff = User::where('email', 'stafftest@example.com')->first();
    expect($createdStaff)->not->toBeNull();
    expect($createdStaff->hasRole('staff'))->toBeTrue();
    expect($createdStaff->hasPermissionTo('courses.view'))->toBeTrue();
    expect($createdStaff->hasPermissionTo('courses.manage'))->toBeTrue();
});

test('non-admin cannot access staff management', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $staff->givePermissionTo('courses.view');

    $this->actingAs($staff);

    $response = $this->get(route('staff.index'));
    $response->assertForbidden();
});

test('staff with courses.view can access courses index', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $staff->givePermissionTo('courses.view');

    $this->actingAs($staff);

    $response = $this->get(route('courses.index'));
    $response->assertOk();
});

test('staff without courses.view cannot access courses index', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');

    $this->actingAs($staff);

    $response = $this->get(route('courses.index'));
    $response->assertForbidden();
});

test('staff without courses.manage cannot access course creation', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $staff->givePermissionTo('courses.view');

    $this->actingAs($staff);

    $response = $this->get(route('courses.create'));
    $response->assertForbidden();
});

test('staff with courses.manage can access course creation', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $staff->givePermissionTo('courses.view');
    $staff->givePermissionTo('courses.manage');

    $this->actingAs($staff);

    $response = $this->get(route('courses.create'));
    $response->assertOk();
});

test('staff dashboard renders properly for staff without financial revenue', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');
    $staff->givePermissionTo('courses.view');

    $this->actingAs($staff);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => 
        $page->component('admin/dashboard/index')
             ->has('stats')
             ->where('auth.role.0', 'staff')
    );
});
