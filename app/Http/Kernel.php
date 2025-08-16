// Di file app/Http/Kernel.php (Laravel 10) atau bootstrap/app.php (Laravel 11)

// Untuk Laravel 10 - tambahkan di array $middlewareAliases:
protected $middlewareAliases = [
// ... middleware lainnya
'role' => \App\Http\Middleware\RoleMiddleware::class,
];

// Untuk Laravel 11 - tambahkan di bootstrap/app.php:
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
