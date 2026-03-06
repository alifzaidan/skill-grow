<?php

use App\Http\Controllers\Api\InvoiceApiController;
use App\Http\Controllers\Api\UserApiController;
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

// Public API Routes
Route::middleware(['auth:sanctum', 'token.ability:external-api'])->group(function () {
    Route::get('/users', [UserApiController::class, 'index'])->name('api.users.index');
    Route::get('/users/{id}', [UserApiController::class, 'show'])->name('api.users.show');

    Route::get('/invoices', [InvoiceApiController::class, 'index'])->name('api.invoices.index');
    Route::get('/invoices/statistics', [InvoiceApiController::class, 'statistics'])->name('api.invoices.statistics');
    Route::get('/invoices/{id}', [InvoiceApiController::class, 'show'])->name('api.invoices.show');
});
