<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\Branch;
use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthAndTimetableTest extends TestCase
{
    use RefreshDatabase;

    public function test_trainer_can_login_with_username_or_email(): void
    {
        User::create([
            'name' => 'Trainer One',
            'username' => 'trainer1',
            'email' => 'trainer1@example.com',
            'password' => 'secret123',
            'role' => 'trainer',
            'status' => 'active',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'username' => 'trainer1',
            'password' => 'secret123',
        ])->assertOk();

        $this->postJson('/api/v1/auth/login', [
            'username' => 'trainer1@example.com',
            'password' => 'secret123',
        ])->assertOk();
    }

    public function test_timetable_can_be_created_with_image_payload_without_asset_id(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'username' => 'admin1',
            'email' => 'admin@example.com',
            'password' => 'secret123',
            'role' => 'admin',
            'status' => 'active',
        ]);

        $branch = Branch::create(['name' => 'Development', 'code' => 'DEV']);
        $group = Group::create(['branch_id' => $branch->id, 'name' => 'G1']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/timetables', [
            'targetType' => 'group',
            'targetId' => $group->id,
            'image' => [
                'name' => 'timetable.png',
                'data' => 'data:image/png;base64,' . base64_encode('fake-image'),
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.targetType', 'group');

        $this->assertDatabaseCount('assets', 1);
        $this->assertDatabaseCount('timetables', 1);

        $asset = Asset::first();
        $this->assertNotNull($asset);
        $this->assertDatabaseHas('timetables', [
            'target_group_id' => $group->id,
            'asset_id' => $asset->id,
        ]);
    }
}
