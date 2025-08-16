<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequirePassword
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->session()->has('auth.password_confirmed_at')) {
            return redirect()->route('password.confirm');
        }

        return $next($request);
    }
}
