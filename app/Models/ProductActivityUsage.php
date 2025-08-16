<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductActivityUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'activity_id',
        'cost_driver_id',
        'quantity_consumed',
        'usage_date',
        'notes',
    ];

    protected $casts = [
        'quantity_consumed' => 'float',
        'usage_date' => 'date',
    ];

    // Define relationships
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
