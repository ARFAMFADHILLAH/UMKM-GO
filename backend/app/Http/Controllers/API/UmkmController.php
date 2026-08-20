<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\UmkmResource;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Models\Umkm;
use Illuminate\Http\Request;

class UmkmController extends Controller
{
    public function index(Request $request)
    {
        $query = Umkm::with('category')->where('is_verified', true);

        // Filter Berdasarkan Pencarian Nama / Deskripsi
        if ($request->has('search') && $request->search != '') {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Filter Berdasarkan Kategori
        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        // Filter Berdasarkan Kota
        if ($request->has('city') && $request->city != '') {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Pagination 10 data per halaman
        $umkms = $query->latest()->paginate(10);

        return UmkmResource::collection($umkms);
    }

    public function show(string $slug)
    {
        $umkm = Umkm::with('category')->where('slug', $slug)->first();

        if (!$umkm) {
            return response()->json([
                'success' => false,
                'message' => 'Data UMKM tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail UMKM',
            'data' => new UmkmResource($umkm)
        ]);
    }
    
    public function store(Request $request)
{
    $request->validate([
        'category_id' => 'required|exists:categories,id',
        'name' => 'required|string|max:255',
        'description' => 'required|string',
        'address' => 'required|string',
        'province' => 'required|string',
        'city' => 'required|string',
        'phone_whatsapp' => 'required|string',
        'instagram' => 'nullable|string',
        'website_url' => 'nullable|url',
        'image_cover' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Max 2MB
        'latitude' => 'nullable|numeric',
        'longitude' => 'nullable|numeric',
    ]);

    $imagePath = null;
    if ($request->hasFile('image_cover')) {
        // Simpan gambar ke folder storage/app/public/umkms
        $imagePath = $request->file('image_cover')->store('umkms', 'public');
    }

    $umkm = Umkm::create([
        'user_id' => $request->user()->id, // Otomatis ambil ID user yang sedang login
        'category_id' => $request->category_id,
        'name' => $request->name,
        'slug' => Str::slug($request->name) . '-' . Str::random(5), // Slug unik
        'description' => $request->description,
        'address' => $request->address,
        'province' => $request->province,
        'city' => $request->city,
        'phone_whatsapp' => $request->phone_whatsapp,
        'instagram' => $request->instagram,
        'website_url' => $request->website_url,
        'image_cover' => $imagePath,
        'latitude' => $request->latitude,
        'longitude' => $request->longitude,
        'is_verified' => true,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'UMKM berhasil didaftarkan!',
        'data' => new UmkmResource($umkm)
    ], 201);
}

// Update Data UMKM
public function update(Request $request, int $id)
{
    $umkm = Umkm::findOrFail($id);

    // Cek Keamanan: Pastikan hanya pemilik yang bisa ubah
    if ($umkm->user_id !== $request->user()->id) {
        return response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki hak akses untuk mengubah data ini'
        ], 403);
    }

    $request->validate([
        'category_id' => 'sometimes|required|exists:categories,id',
        'name' => 'sometimes|required|string|max:255',
        'description' => 'sometimes|required|string',
        'address' => 'sometimes|required|string',
        'province' => 'sometimes|required|string',
        'city' => 'sometimes|required|string',
        'phone_whatsapp' => 'sometimes|required|string',
        'image_cover' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
    ]);

    // Update foto jika ada gambar baru yang diunggah
    if ($request->hasFile('image_cover')) {
        if ($umkm->image_cover) {
            Storage::disk('public')->delete($umkm->image_cover);
        }
        $umkm->image_cover = $request->file('image_cover')->store('umkms', 'public');
    }

    $umkm->update($request->only([
        'category_id', 'name', 'description', 'address', 
        'province', 'city', 'phone_whatsapp', 'instagram', 
        'website_url', 'latitude', 'longitude'
    ]));

    return response()->json([
        'success' => true,
        'message' => 'Data UMKM berhasil diperbarui',
        'data' => new UmkmResource($umkm)
    ]);
}

// Hapus UMKM
public function destroy(Request $request, int $id)
{
    $umkm = Umkm::findOrFail($id);

    if ($umkm->user_id !== $request->user()->id) {
        return response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki hak akses untuk menghapus data ini'
        ], 403);
    }

    if ($umkm->image_cover) {
        Storage::disk('public')->delete($umkm->image_cover);
    }

    $umkm->delete();

    return response()->json([
        'success' => true,
        'message' => 'Data UMKM berhasil dihapus'
    ]);
}

}
