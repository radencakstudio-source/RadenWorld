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
        // Auto-ensure sqlite file exists so it never throws 'Database file does not exist'
        if (config('database.default') === 'sqlite') {
            $dbPath = config('database.connections.sqlite.database');
            if ($dbPath && !file_exists($dbPath) && !str_starts_with($dbPath, ':memory:')) {
                $dir = dirname($dbPath);
                if (!is_dir($dir)) {
                    @mkdir($dir, 0755, true);
                }
                @touch($dbPath);
            }
        }

        $host = (string)request()->getHost();
        $isForwardedHttps = request()->header('x-forwarded-proto') === 'https';
        $isTunnel = str_contains($host, 'ngrok') ||
                    str_contains($host, 'trycloudflare') ||
                    str_contains($host, 'localtunnel') ||
                    str_contains($host, 'pinggy');

        if ($isForwardedHttps || $isTunnel) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        if ($isTunnel || ($isForwardedHttps && !in_array($host, ['localhost', '127.0.0.1']))) {
            // Pemain eksternal via tunnel (ngrok dll) hanya terhubung ke port 3001 (limit single tunnel port).
            // Arahkan otomatis ke aset bundle build produksi (manifest.json) tanpa butuh port 5173:
            Vite::useHotFile(storage_path('framework/cache/disabled_hot_for_tunnel'));
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
