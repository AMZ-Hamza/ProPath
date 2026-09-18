<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Group;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TrainerProfile;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private const ADMIN_ACCOUNT_ROLES = ['admin', 'proAdmin'];

    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('group_id')) {
            $query->whereHas('studentProfile', fn($q) => $q->where('group_id', $request->group_id));
        }

        $query->with(['studentProfile.branch', 'studentProfile.group', 'trainerProfile']);

        $users = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 50));

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'currentPage' => $users->currentPage(),
                'lastPage' => $users->lastPage(),
                'perPage' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        if ($this->isAdminAccountRole($request->role) && !$this->actingUserIsProAdmin()) {
            return response()->json([
                'message' => 'Only proAdmin can create admin accounts.',
            ], 403);
        }

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => $request->input('active', true) ? 'active' : 'inactive',
            ]);

            // Auto-create student profile
            if ($request->role === 'student') {
                $group = Group::findOrFail($request->groupId);
                StudentProfile::create([
                    'user_id' => $user->id,
                    'enrollment_number' => $request->enrollmentNumber ?? $this->generateEnrollmentNumber(),
                    'branch_id' => $request->branchId ?? $group->branch_id,
                    'group_id' => $request->groupId,
                ]);
            }

            // Auto-create trainer profile
            if ($request->role === 'trainer') {
                TrainerProfile::create([
                    'user_id' => $user->id,
                ]);
            }

            $user->load(['studentProfile.branch', 'studentProfile.group', 'trainerProfile']);

            return response()->json([
                'data' => new UserResource($user),
                'message' => 'User created.',
            ], 201);
        });
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['studentProfile.branch', 'studentProfile.group', 'trainerProfile']);

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $requestedRole = $request->input('role', $user->role);

        if ($this->touchesAdminAccount($user->role, $requestedRole) && !$this->actingUserIsProAdmin()) {
            return response()->json([
                'message' => 'Only proAdmin can modify admin accounts.',
            ], 403);
        }

        return DB::transaction(function () use ($request, $user) {
            $oldRole = $user->role;
            $newRole = $request->input('role', $oldRole);

            $userData = array_filter([
                'name' => $request->input('name'),
                'username' => $request->input('username'),
                'email' => $request->input('email'),
                'role' => $request->input('role'),
            ], fn($v) => !is_null($v));

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            if ($request->has('active')) {
                $userData['status'] = $request->active ? 'active' : 'inactive';
            }

            $user->update($userData);

            // Handle role change: old role -> new role
            if ($oldRole !== $newRole) {
                $this->handleRoleChange($user, $oldRole, $newRole, $request);

                AuditService::log(
                    'user.role_changed',
                    auth()->id(),
                    'user',
                    $user->id,
                    ['role' => $oldRole],
                    ['role' => $newRole],
                );
            }

            // Update student profile details if still a student
            if ($newRole === 'student' && $request->filled('groupId')) {
                $group = Group::findOrFail($request->groupId);
                $profile = $user->studentProfile;
                if ($profile) {
                    $profile->update([
                        'group_id' => $request->groupId,
                        'branch_id' => $request->branchId ?? $group->branch_id,
                        'enrollment_number' => $request->enrollmentNumber ?? $profile->enrollment_number,
                    ]);
                }
            }

            $user->load(['studentProfile.branch', 'studentProfile.group', 'trainerProfile']);

            return response()->json([
                'data' => new UserResource($user),
                'message' => 'User updated.',
            ]);
        });
    }

    public function destroy(User $user): JsonResponse
    {
        if ($this->isAdminAccountRole($user->role) && !$this->actingUserIsProAdmin()) {
            return response()->json([
                'message' => 'Only proAdmin can delete admin accounts.',
            ], 403);
        }

        // Block deletion of last admin
        if ($this->isAdminAccountRole($user->role)) {
            $adminCount = User::whereIn('role', self::ADMIN_ACCOUNT_ROLES)->where('status', 'active')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'Cannot delete the last active admin account.',
                ], 422);
            }
        }

        DB::transaction(function () use ($user) {
            // If student, delete attendance and profile
            if ($user->role === 'student' && $user->studentProfile) {
                $user->studentProfile->attendanceRecords()->delete();
                $user->studentProfile->gradeRecords()->delete();
                $user->studentProfile->delete();
            }

            // If trainer, unassign from subjects
            if ($user->role === 'trainer') {
                Subject::where('trainer_user_id', $user->id)->update(['trainer_user_id' => null]);
                $user->trainerProfile?->delete();
            }

            $user->tokens()->delete();
            $user->delete();
        });

        return response()->json([
            'message' => 'User deleted.',
        ]);
    }

    private function handleRoleChange(User $user, string $oldRole, string $newRole, $request): void
    {
        // Clean up old role data
        if ($oldRole === 'student' && $user->studentProfile) {
            $user->studentProfile->attendanceRecords()->delete();
            $user->studentProfile->gradeRecords()->delete();
            $user->studentProfile->delete();
        }

        if ($oldRole === 'trainer') {
            Subject::where('trainer_user_id', $user->id)->update(['trainer_user_id' => null]);
            $user->trainerProfile?->delete();
        }

        // Set up new role data
        if ($newRole === 'student' && $request->filled('groupId')) {
            $group = Group::findOrFail($request->groupId);
            StudentProfile::create([
                'user_id' => $user->id,
                'enrollment_number' => $request->enrollmentNumber ?? $this->generateEnrollmentNumber(),
                'branch_id' => $request->branchId ?? $group->branch_id,
                'group_id' => $request->groupId,
            ]);
        }

        if ($newRole === 'trainer') {
            TrainerProfile::firstOrCreate(['user_id' => $user->id]);
        }
    }

    private function generateEnrollmentNumber(): string
    {
        return 'STU-' . strtoupper(substr(md5(uniqid()), 0, 8));
    }

    private function actingUserIsProAdmin(): bool
    {
        return auth()->user()?->role === 'proAdmin';
    }

    private function isAdminAccountRole(?string $role): bool
    {
        return in_array($role, self::ADMIN_ACCOUNT_ROLES, true);
    }

    private function touchesAdminAccount(?string ...$roles): bool
    {
        foreach ($roles as $role) {
            if ($this->isAdminAccountRole($role)) {
                return true;
            }
        }

        return false;
    }
}
