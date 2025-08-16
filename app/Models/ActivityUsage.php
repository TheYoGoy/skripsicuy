<?php
// app/Models/ActivityUsage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
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
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function costDriver()
    {
        return $this->belongsTo(CostDriver::class);
    }
}