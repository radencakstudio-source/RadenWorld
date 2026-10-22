<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (request()->header('x-forwarded-proto') === 'https' || str_contains((string)request()->getHost(), 'ngrok')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        if (str_contains((string)request()->getHost(), 'ngrok')) {
            // Pemain eksternal via ngrok hanya terhubung ke port 3001 (limit 1 tunnel free ngrok).
            // Arahkan otomatis ke aset bundle build produksi (manifest.json) tanpa butuh port 5173:
            Vite::useHotFile(storage_path('framework/cache/disabled_hot_for_ngrok'));
        } elseif (file_exists(public_path('hot'))) {
            // Dukungan Akses Fleksibel Jaringan Lokal / Wi-Fi (IP Dinamis):
            // Jika Vite sedang aktif (HMR / public/hot), arahkan URL aset Vite secara dinamis
            // ke host/IP yang digunakan oleh browser saat ini (request()->getHost()).
            $host = request()->getHost();
            if (!empty($host)) {
                $cacheDir = storage_path('framework/cache');
                if (!is_dir($cacheDir)) {
                    @mkdir($cacheDir, 0755, true);
                }
                $dynamicHotFile = $cacheDir . '/hot_' . md5($host);
                $hotUrl = "http://{$host}:5173";
                if (!file_exists($dynamicHotFile) || trim((string)@file_get_contents($dynamicHotFile)) !== $hotUrl) {
                    @file_put_contents($dynamicHotFile, $hotUrl);
                }
                Vite::useHotFile($dynamicHotFile);
            }
        }
    }
}
