<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SetupRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\Trainer;
use App\Models\User;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * POST /api/v1/setup
     * Creates first admin and initializes platform. Only works when no users exist.
     */
    public function setup(SetupRequest $request): JsonResponse
    {
        if (User::count() > 0) {
            return response()->json([
                'message' => 'Platform is already configured.',
            ], 409);
        }

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => $request->password,
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Update system settings if appName provided
        if ($request->filled('appName')) {
            $settings = SystemSetting::instance();
            $settings->update(['app_name' => $request->appName]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
            'message' => 'Platform setup complete.',
        ], 201);
    }

    /**
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $identifier = trim($request->username);
        $trainer = Trainer::query()
            ->where(function ($query) use ($identifier) {
                $query->where('username', $identifier)
                    ->orWhere('email', $identifier);
            })
            ->first();

        $user = $trainer ?: User::query()
            ->where(function ($query) use ($identifier) {
                $query->where('username', $identifier)
                    ->orWhere('email', $identifier);
            })
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Account is inactive.',
            ], 403);
        }

        $user->update(['last_login_at' => now()]);
        $token = $user->createToken($user->role . '-auth-token')->plainTextToken;
        $user->load(['studentProfile.branch', 'studentProfile.group', 'trainerProfile']);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
            'message' => 'Login successful.',
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(): JsonResponse
    {
        Auth::user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    /**
     * GET /api/v1/auth/me
     */
    public function me(): JsonResponse
    {
        $user = Auth::user();
        $user->load(['studentProfile.branch', 'studentProfile.group', 'trainerProfile']);

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }
}
