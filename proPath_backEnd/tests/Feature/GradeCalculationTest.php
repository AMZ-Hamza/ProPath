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

class GradeCalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_final_grade_formula(): void
    {
        $user = User::create(['name' => 'Admin', 'username' => 'admin1', 'email' => 'a@test.com', 'password' => 'pass', 'role' => 'admin', 'status' => 'active']);
        $branch = Branch::create(['name' => 'IT']);
        $group = Group::create(['branch_id' => $branch->id, 'name' => 'G1']);
        $studentUser = User::create(['name' => 'Student', 'username' => 'stu1', 'email' => 's@test.com', 'password' => 'pass', 'role' => 'student', 'status' => 'active']);
        $student = StudentProfile::create(['user_id' => $studentUser->id, 'enrollment_number' => 'STU-1', 'branch_id' => $branch->id, 'group_id' => $group->id]);
        $subject = Subject::create(['name' => 'Math']);

        $grade = GradeRecord::create([
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'cc1' => 12.00,
            'cc2' => 14.00,
            'cc3' => 10.00,
            'efm' => 16.00,
            'recorded_by_user_id' => $user->id,
        ]);

        $grade->calculateFinalGrade();

        // Expected: (16 * 0.75) + ((12+14+10)/3 * 0.25) = 12 + (12 * 0.25) = 15.00
        $this->assertEquals(15.00, (float) $grade->final_grade);
    }

    public function test_final_grade_uses_available_continuous_control_grades(): void
    {
        $user = User::create(['name' => 'Admin2', 'username' => 'admin2', 'email' => 'a2@test.com', 'password' => 'pass', 'role' => 'admin', 'status' => 'active']);
        $branch = Branch::create(['name' => 'IT2']);
        $group = Group::create(['branch_id' => $branch->id, 'name' => 'G2']);
        $studentUser = User::create(['name' => 'Student2', 'username' => 'stu2', 'email' => 's2@test.com', 'password' => 'pass', 'role' => 'student', 'status' => 'active']);
        $student = StudentProfile::create(['user_id' => $studentUser->id, 'enrollment_number' => 'STU-2', 'branch_id' => $branch->id, 'group_id' => $group->id]);
        $subject = Subject::create(['name' => 'Math2']);

        $grade = GradeRecord::create([
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'cc1' => 12.00,
            'cc2' => null,
            'cc3' => 10.00,
            'efm' => 16.00,
            'recorded_by_user_id' => $user->id,
        ]);

        $grade->calculateFinalGrade();

        // Expected: (16 * 0.75) + ((12+10)/2 * 0.25) = 12 + 2.75 = 14.75
        $this->assertEquals(14.75, (float) $grade->final_grade);
    }
}
