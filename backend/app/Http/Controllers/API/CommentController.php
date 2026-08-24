<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Umkm;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    // Daftar komentar publik, terbaru dulu (nama user di-flatten, tanpa email)
    public function index(string $slug)
    {
        $umkm = Umkm::where('slug', $slug)->first();

        if (! $umkm) {
            return response()->json([
                'success' => false,
                'message' => 'Data UMKM tidak ditemukan',
            ], 404);
        }

        $comments = Comment::query()
            ->with('user:id,name')
            ->where('umkm_id', $umkm->id)
            ->latest()
            ->paginate(10);

        return CommentResource::collection($comments);
    }

    // Tulis komentar baru (auth + rate limit di route)
    public function store(Request $request, string $slug)
    {
        $request->validate([
            'comment' => 'required|string|max:500',
        ]);

        $umkm = Umkm::where('slug', $slug)->first();

        if (! $umkm) {
            return response()->json([
                'success' => false,
                'message' => 'Data UMKM tidak ditemukan',
            ], 404);
        }

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'umkm_id' => $umkm->id,
            'comment' => $request->input('comment'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Komentar berhasil dikirim',
            'data' => new CommentResource($comment->load('user:id,name')),
        ], 201);
    }
}
