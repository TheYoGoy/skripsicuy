<?php
// app/Models/Cost.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cost extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'amount',
        'description',
        'cost_driver_id',
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    // === RELATIONSHIPS YANG SUDAH ADA ===
    // Relationship dengan CostDriver - direct foreign key
    public function driver()
    {
        return $this->belongsTo(CostDriver::class, 'cost_driver_id');
    }

    // Relationship dengan CostActivityAllocation
    public function allocations()
    {
        return $this->hasMany(CostActivityAllocation::class);
    }

    // TAMBAHAN: Many-to-many relationship dengan Activity melalui CostActivityAllocation
    public function activities()
    {
        return $this->belongsToMany(Activity::class, 'cost_activity_allocations')
                    ->withPivot('allocated_amount', 'allocation_date', 'notes')
                    ->withTimestamps();
    }

    // === TAMBAHKAN RELATIONSHIPS BARU DI SINI ===
    public function costActivityAllocations()
    {
        return $this->hasMany(CostActivityAllocation::class);
    }
}