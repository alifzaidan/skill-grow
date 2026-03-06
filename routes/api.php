<?php

use App\Http\Controllers\DiscountCodeController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::post('/discount-codes/validate', [DiscountCodeController::class, 'validate'])->name('discount-codes.validate');

Route::post('/doku/callback', [InvoiceController::class, 'callbackDoku'])->name('doku.callback');

Route::get('/search', [SearchController::class, 'search']);

Route::post('/check-email', function (Request $request) {
    $user = \App\Models\User::where('email', $request->email)->first();
    
    if ($user) {
        return response()->json([
            'exists' => true,
            'name' => $user->name,
            'phone_number' => $user->phone_number,
        ]);
    }
    
    return response()->json(['exists' => false]);
});
