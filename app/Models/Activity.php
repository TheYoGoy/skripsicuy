<?php
// app/Models/Activity.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'department_id',  // TAMBAHAN BARU
        'primary_cost_driver_id',
    ];

    // === RELATIONSHIPS YANG SUDAH ADA ===
    public function primaryCostDriver()
    {
        return $this->belongsTo(CostDriver::class, 'primary_cost_driver_id');
    }

    public function costDriver()
    {
        return $this->belongsTo(CostDriver::class);
    }

    public function costActivityAllocations()
    {
        return $this->hasMany(CostActivityAllocation::class);
    }

    // PENTING: Relationship ini digunakan di controller
    public function activityCostDriverUsages()
    {
        return $this->hasMany(ActivityCostDriverUsage::class);
    }

    // === TAMBAHAN BARU ===
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    // === RELATIONSHIPS LAINNYA ===
    public function resourceUsages()
    {
        return $this->hasMany(ResourceUsage::class);
    }

    public function activityUsages()
    {
        return $this->hasMany(ActivityUsage::class);
    }

    public function productCostAllocations()
    {
        return $this->hasMany(ProductCostAllocation::class);
    }
}
