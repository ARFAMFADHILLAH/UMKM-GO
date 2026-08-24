<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\Umkm;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    // Nilai rating milik user login untuk satu UMKM
    public function myRating(Request $request, string $slug)
    {
        $umkm = Umkm::where('slug', $slug)->first();

        if (! $umkm) {
            return response()->json([
                'success' => false,
                'message' => 'Data UMKM tidak ditemukan',
            ], 404);
        }

        $rating = Rating::where('user_id', $request->user()->id)
            ->where('umkm_id', $umkm->id)
            ->first();

        if (! $rating) {
            return response()->json([
                'success' => false,
                'message' => 'Anda belum memberikan penilaian untuk UMKM ini',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => ['rating' => $rating->rating],
        ]);
    }

    // Beri / ubah nilai rating (1 user 1 nilai per lapak)
    public function rate(Request $request, string $slug)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $umkm = Umkm::where('slug', $slug)->first();

        if (! $umkm) {
            return response()->json([
                'success' => false,
                'message' => 'Data UMKM tidak ditemukan',
            ], 404);
        }

        Rating::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'umkm_id' => $umkm->id,
            ],
            [
                'rating' => $request->integer('rating'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Penilaian berhasil disimpan',
            'data' => ['rating' => (int) $request->rating],
        ]);
    }
}
