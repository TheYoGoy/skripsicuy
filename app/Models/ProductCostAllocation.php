<?php
// app/Models/ProductCostAllocation.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductCostAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'activity_id',
        'allocated_amount',
        'allocation_date',
        'notes',
    ];

    protected $casts = [
        'allocated_amount' => 'float',
        'allocation_date' => 'date',
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
}