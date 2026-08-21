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
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ],
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
