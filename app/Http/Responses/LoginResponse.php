<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = Auth::user();

        $redirect = match ($user->role) {
            'admin', 'manager' => route('dashboard'),
            'operator' => route('productions.index'),
            default => '/login',
        };

        return redirect()->intended($redirect);
    }
}
