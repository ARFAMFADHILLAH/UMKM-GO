<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\UmkmController;
use Illuminate\Support\Facades\Route;

// Public Endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/umkms', [UmkmController::class, 'index']);
Route::get('/umkms/{slug}', [UmkmController::class, 'show']);

// Protected Endpoints (Harus menyertakan Token Auth/Bearer)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/umkms', [UmkmController::class, 'store']);
    Route::post('/umkms/{id}', [UmkmController::class, 'update']); // Method POST (dengan _method=PUT jika upload file)
    Route::delete('/umkms/{id}', [UmkmController::class, 'destroy']);
});

