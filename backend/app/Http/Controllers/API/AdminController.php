<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\UmkmResource;
use App\Models\Umkm;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Daftar UMKM yang menunggu verifikasi (belum verified & belum ditolak)
    public function pending(Request $request)
    {
        $umkms = Umkm::query()
            ->with('category')
            ->withCount([
                'ratings as ratings_count',
                'ratings as avg_rating' => fn ($q) => $q->selectRaw('coalesce(avg(rating), 0)'),
            ])
            ->where('is_verified', false)
            ->whereNull('rejected_at')
            ->latest()
            ->paginate(10);

        return UmkmResource::collection($umkms);
    }

    // Setujui pengajuan: tayangkan UMKM ke publik
    public function verify(int $id)
    {
        $umkm = Umkm::findOrFail($id);

        if ($umkm->is_verified) {
            return response()->json([
                'success' => false,
                'message' => 'UMKM ini sudah terverifikasi sebelumnya',
            ], 422);
        }

        $umkm->update([
            'is_verified' => true,
            'rejected_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'UMKM berhasil diverifikasi',
            'data' => new UmkmResource($umkm->load('category')),
        ]);
    }

    // Tolak pengajuan: keluar dari list pending, data tetap tersimpan
    public function reject(int $id)
    {
        $umkm = Umkm::findOrFail($id);

        $umkm->update(['rejected_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan UMKM berhasil ditolak',
        ]);
    }
}
