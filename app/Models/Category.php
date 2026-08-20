<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\relations\HasMany;

class Category extends Model
{
    protected $guarded = ['id'];

    public function umkms(): HasMany
    {
        return $this->hasMany(Umkm::class);
    }
}
