<?php

namespace Database\Factories;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubjectFactory extends Factory
{
    protected $model = Subject::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2),
            'code' => strtoupper(fake()->unique()->lexify(3)) . fake()->numberBetween(100, 999),
            'description' => fake()->sentence(),
            'coefficient' => fake()->randomFloat(2, 1, 5),
            'trainer_user_id' => null,
        ];
    }
}
