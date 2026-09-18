<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

class GroupFactory extends Factory
{
    protected $model = Group::class;

    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'name' => fake()->unique()->word(),
            'year' => fake()->numberBetween(1, 3),
        ];
    }
}
