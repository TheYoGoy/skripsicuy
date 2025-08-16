<?php
// app/Models/ProductionRecord.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity_produced',
        'production_date',
        'notes',
    ];

    protected $casts = [
        'quantity_produced' => 'float',
        'production_date' => 'date',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}