<?php
// sudut-timur-backend/app/Http/Middleware/CheckUserRole.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Pastikan pengguna sudah login
        if (! $request->user()) {
            // Jika tidak login, redirect ke halaman login
            return redirect()->route('login');
        }

        // Periksa apakah pengguna memiliki salah satu peran yang diizinkan
        if (! $request->user()->hasRole($roles)) {
            // Jika tidak memiliki peran yang diizinkan, redirect ke dashboard atau halaman error
            return redirect()->route('dashboard')->with('error', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}
