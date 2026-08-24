<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UmkmResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'address' => $this->address,
            'province' => $this->province,
            'city' => $this->city,
            'phone_whatsapp' => $this->phone_whatsapp,
            'instagram' => $this->instagram,
            'website_url' => $this->website_url,
            'image_cover' => $this->image_cover ? asset('storage/'.$this->image_cover) : null,
            'photos' => collect($this->photos ?? [])
                ->map(fn ($p) => asset('storage/'.$p))
                ->values(),
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'is_verified' => (bool) $this->is_verified,
            'avg_rating' => isset($this->avg_rating) ? round((float) $this->avg_rating, 1) : null,
            'ratings_count' => $this->ratings_count ?? 0,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ],
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
