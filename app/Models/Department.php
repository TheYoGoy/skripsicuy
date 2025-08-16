<?php
// app/Models/Department.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    // Define the fillable attributes for mass assignment
    protected $fillable = [
        'name',
        'description',
    ];

    // === RELATIONSHIPS ===
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    // Tambahkan relationship lain jika diperlukan
    public function costs()
    {
        return $this->hasMany(Cost::class);
    }

    public function resourceUsages()
    {
        return $this->hasMany(ResourceUsage::class);
    }
}
