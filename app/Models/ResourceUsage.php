<?php
// app/Models/ResourceUsage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResourceUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'cost_driver_id',
        'usage_quantity',
        'usage_date',
        'notes',
    ];

    protected $casts = [
        'usage_quantity' => 'float',
        'usage_date' => 'date',
    ];

    // Relationships
    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function costDriver()
    {
        return $this->belongsTo(CostDriver::class);
    }
}