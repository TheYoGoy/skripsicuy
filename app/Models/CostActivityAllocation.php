<?php
// app/Models/CostActivityAllocation.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CostActivityAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'cost_id',
        'activity_id',
        'allocated_amount',
        'allocation_date',
        'notes',
    ];

    protected $casts = [
        'allocated_amount' => 'float',
        'allocation_date' => 'date',
    ];

    // Define relationships
    public function cost()
    {
        return $this->belongsTo(Cost::class);
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }
}