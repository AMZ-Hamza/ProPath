<?php

namespace Database\Factories;

use App\Models\StudentProfile;
use App\Models\Branch;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentProfileFactory extends Factory
{
    protected $model = StudentProfile::class;

    public function definition(): array
    {
        $branch = Branch::factory()->create();
        $group = Group::factory()->create(['branch_id' => $branch->id]);
        $user = User::factory()->create(['role' => 'student']);

        return [
            'user_id' => $user->id,
            'enrollment_number' => 'STU-' . strtoupper(fake()->unique()->numerify('########')),
            'branch_id' => $branch->id,
            'group_id' => $group->id,
        ];
    }
}
