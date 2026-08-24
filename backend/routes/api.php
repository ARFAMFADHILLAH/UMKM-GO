<?php

use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\CommentController;
use App\Http\Controllers\API\RatingController;
use App\Http\Controllers\API\UmkmController;
use Illuminate\Support\Facades\Route;

// Public Endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/umkms', [UmkmController::class, 'index']);
Route::get('/umkms/{slug}', [UmkmController::class, 'show']);
Route::get('/umkms/{slug}/comments', [CommentController::class, 'index']);

// Protected Endpoints (Harus menyertakan Token Auth/Bearer)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/my-umkms', [UmkmController::class, 'myUmkms']);

    Route::post('/umkms', [UmkmController::class, 'store']);
    Route::post('/umkms/{id}', [UmkmController::class, 'update']); // Method POST (dengan _method=PUT jika upload file)
    Route::delete('/umkms/{id}', [UmkmController::class, 'destroy']);

    Route::get('/umkms/{slug}/my-rating', [RatingController::class, 'myRating']);
    Route::post('/umkms/{slug}/rate', [RatingController::class, 'rate']);

    // Rate limit 10 request/menit biar tidak di-spam
    Route::post('/umkms/{slug}/comments', [CommentController::class, 'store'])->middleware('throttle:10,1');
});

// Admin Endpoints (auth + role admin, selain itu -> 403)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/umkms/pending', [AdminController::class, 'pending']);
    Route::patch('/umkms/{id}/verify', [AdminController::class, 'verify']);
    Route::patch('/umkms/{id}/reject', [AdminController::class, 'reject']);
});
