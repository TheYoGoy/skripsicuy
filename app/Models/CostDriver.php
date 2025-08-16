<?php
// app/Models/CostDriver.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CostDriver extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'unit',
    ];

    // === RELATIONSHIPS YANG SUDAH ADA ===
    // Relationship dengan Cost
    public function costs()
    {
        return $this->hasMany(Cost::class);
    }

    // Relationship dengan Activity (primary_cost_driver_id)
    public function primaryActivities()
    {
        return $this->hasMany(Activity::class, 'primary_cost_driver_id');
    }

    // Relationship dengan ActivityCostDriverUsage
    public function activityCostDriverUsages()
    {
        return $this->hasMany(ActivityCostDriverUsage::class);
    }

    // === TAMBAHKAN RELATIONSHIPS BARU DI SINI ===
    public function resourceUsages()
    {
        return $this->hasMany(ResourceUsage::class);
    }

    public function activityUsages()
    {
        return $this->hasMany(ActivityUsage::class);
    }
}