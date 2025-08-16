<?php
// sudut-timur-backend/app/Models/Production.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Production extends Model
{
    use HasFactory;

    // Define the fillable attributes for mass assignment
    protected $fillable = [
        'product_id',
        'production_date',
        'quantity',
        'notes',
    ];

    protected $casts = [
        'production_date' => 'date',
    ];

    // Define relationship with Product model
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
