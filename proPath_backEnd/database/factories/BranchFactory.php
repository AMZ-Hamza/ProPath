<?php

namespace Database\Factories;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2),
            'code' => strtoupper(fake()->unique()->lexify(4)),
            'description' => fake()->sentence(),
        ];
    }
}
