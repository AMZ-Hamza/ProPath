<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Unauthorized. Insufficient role.');
        }

        $allowed = in_array($user->role, $roles, true)
            || ($user->role === 'proAdmin' && in_array('admin', $roles, true));

        if (!$allowed) {
            abort(403, 'Unauthorized. Insufficient role.');
        }

        return $next($request);
    }
}
