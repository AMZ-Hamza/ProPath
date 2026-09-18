<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\GradeRecord;
use App\Models\Group;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GradeAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_trainer_can_save_grades(): void
    {
        $trainer = User::create([
            'name' => 'Trainer One',
            'username' => 'trainer1',
            'email' => 't1@test.com',
            'password' => 'secret123',
            'role' => 'trainer',
            'status' => 'active',
        ]);

        $branch = Branch::create(['name' => 'Development']);
        $group = Group::create(['branch_id' => $branch->id, 'name' => 'DEV101']);
        
        $studentUser = User::create([
            'name' => 'Student One',
            'username' => 'student1',
            'email' => 's1@test.com',
            'password' => 'secret123',
            'role' => 'student',
            'status' => 'active',
        ]);
        
        $student = StudentProfile::create([
            'user_id' => $studentUser->id,
            'enrollment_number' => 'STU-101',
            'branch_id' => $branch->id,
            'group_id' => $group->id,
        ]);

        $subject = Subject::create([
            'name' => 'PHP Laravel',
            'trainer_user_id' => $trainer->id,
        ]);

        $payload = [
            'subjectId' => $subject->id,
            'gradesByStudent' => [
                $student->id => [
                    'cc1' => 15.0,
                    'cc2' => 16.5,
                    'cc3' => null,
                    'efm' => 18.0,
                ]
            ]
        ];

        $response = $this->actingAs($trainer, 'sanctum')
            ->postJson('/api/v1/students/grades', $payload);

        $response->assertOk();
        $this->assertDatabaseHas('grade_records', [
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'cc1' => 15.0,
            'cc2' => 16.5,
            'efm' => 18.0,
        ]);
    }

    public function test_admin_gets_403_on_grade_update(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'username' => 'admin1',
            'email' => 'admin1@test.com',
            'password' => 'secret123',
            'role' => 'admin',
            'status' => 'active',
        ]);

        $branch = Branch::create(['name' => 'Development']);
        $group = Group::create(['branch_id' => $branch->id, 'name' => 'DEV101']);
        
        $studentUser = User::create([
            'name' => 'Student One',
            'username' => 'student1',
            'email' => 's1@test.com',
            'password' => 'secret123',
            'role' => 'student',
            'status' => 'active',
        ]);
        
        $student = StudentProfile::create([
            'user_id' => $studentUser->id,
            'enrollment_number' => 'STU-101',
            'branch_id' => $branch->id,
            'group_id' => $group->id,
        ]);

        $subject = Subject::create([
            'name' => 'PHP Laravel',
        ]);

        $payload = [
            'subjectId' => $subject->id,
            'gradesByStudent' => [
                $student->id => [
                    'cc1' => 15.0,
                    'efm' => 18.0,
                ]
            ]
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/students/grades', $payload);

        $response->assertStatus(403);
    }

    public function test_admin_can_still_fetch_grades(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'username' => 'admin1',
            'email' => 'admin1@test.com',
            'password' => 'secret123',
            'role' => 'admin',
            'status' => 'active',
        ]);

        $branch = Branch::create(['name' => 'Development']);
        $group = Group::create(['branch_id' => $branch->id, 'name' => 'DEV101']);
        
        $studentUser = User::create([
            'name' => 'Student One',
            'username' => 'student1',
            'email' => 's1@test.com',
            'password' => 'secret123',
            'role' => 'student',
            'status' => 'active',
        ]);
        
        $student = StudentProfile::create([
            'user_id' => $studentUser->id,
            'enrollment_number' => 'STU-101',
            'branch_id' => $branch->id,
            'group_id' => $group->id,
        ]);

        $subject = Subject::create([
            'name' => 'PHP Laravel',
        ]);

        GradeRecord::create([
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'cc1' => 14.5,
            'efm' => 15.0,
            'recorded_by_user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/grades');

        $response->assertOk()
            ->assertJsonFragment(['cc1' => 14.5]);
    }
}
