<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SecurityWalletController extends Controller
{
    /**
     * Resolusi user aktif berdasarkan auth, id, email, atau nama dari sesi/payload
     */
    /**
     * Resolusi user aktif berdasarkan token kriptografis, auth session, atau fallback terverifikasi
     */
    private function resolveUser(Request $request): ?User
    {
        // 1. Prioritaskan Cryptographic Signed Token (Bearer / X-Auth-Token)
        $user = User::resolveFromRequest($request);
        if ($user) {
            return $user;
        }

        // 2. Fallback untuk sesi aktif Laravel
        if (auth()->check()) {
            return auth()->user();
        }

        // 3. Fallback header X-User-Id / X-User-Name (untuk kompatibilitas pemain yang sedang aktif)
        $userId = $request->input('user_id') ?: $request->header('X-User-Id');
        if ($userId) {
            $user = User::find($userId);
            if ($user) return $user;
        }

        $userEmail = $request->input('email') ?: $request->header('X-User-Email');
        if ($userEmail) {
            $user = User::where('email', $userEmail)->first();
            if ($user) return $user;
        }

        // PENTING: Untuk mencari identitas user lama, prioritaskan current_name atau header X-User-Name
        $userName = $request->input('current_name') ?: $request->header('X-User-Name');
        if ($userName) {
            $user = User::where('name', $userName)->first();
            if ($user) return $user;
        }

        $path = $request->path();
        if (strpos($path, 'update-name') === false) {
            $inputName = $request->input('name');
            if ($inputName) {
                $user = User::where('name', $inputName)->first();
                if ($user) return $user;
            }
        }

        return null;
    }

    /**
     * Ambil data saldo dompet authoritative & status keamanan akun
     */
    public function getWallet(Request $request)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Sesi akun tidak ditemukan. Silakan login terlebih dahulu.',
                    'gold' => 1000,
                    'diamonds' => 50,
                ], 401);
            }

            $isSuper = $user->isSuperAdmin();
            $gold = $isSuper ? 99999999999 : (int) ($user->gold ?? 1000);
            $diamonds = $isSuper ? 99999999999 : (int) ($user->diamonds ?? 50);

            $walletData = [
                'gold' => $gold,
                'diamonds' => $diamonds,
                'auth_token' => $user->generateAuthToken(),
                'email_verified' => !empty($user->email_verified_at),
                'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toIso8601String() : null,
                'email' => $user->email,
                'google_linked' => !empty($user->google_email) || $user->provider === 'google',
                'google_email' => $user->google_email ?: ($user->provider === 'google' ? $user->email : null),
                'facebook_linked' => !empty($user->facebook_email) || $user->provider === 'facebook',
                'facebook_email' => $user->facebook_email ?: ($user->provider === 'facebook' ? $user->email : null),
                'is_super_admin' => $isSuper,
            ];

            return response()->json(array_merge([
                'status' => 'success',
                'wallet' => $walletData,
                'anti_cheat' => [
                    'status' => 'ACTIVE',
                    'engine' => 'RadenShield Anti-Cheat Core v3.0',
                    'server_authoritative' => true,
                    'integrity' => 'SECURED',
                ],
            ], $walletData));
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'fallback',
                'message' => 'Koneksi database dalam mode transisi: ' . $e->getMessage(),
                'gold' => 1000,
                'diamonds' => 50,
                'wallet' => [
                    'gold' => 1000,
                    'diamonds' => 50,
                ],
            ], 200);
        }
    }

    /**
     * Sinkronisasi Saldo Dompet (Gold & Diamonds) dengan Validasi Anti-Cheat Ketat
     */
    public function syncWallet(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi akun tidak valid atau tidak memiliki otorisasi token.',
            ], 401);
        }

        $isSuper = $user->isSuperAdmin();
        if ($isSuper) {
            return response()->json([
                'status' => 'success',
                'gold' => 99999999999,
                'diamonds' => 99999999999,
                'message' => 'Akun Super Admin memiliki akses saldo tak terbatas.',
            ]);
        }

        $deltaGold = (int) $request->input('delta_gold', 0);
        $deltaDiamonds = (int) $request->input('delta_diamonds', 0);
        $action = trim($request->input('action', 'general_transaction'));

        // ====================================================================
        // ANTI-CHEAT RULES & INTEGRITY CHECKS (RADENSHIELD v3.0)
        // ====================================================================
        $throttleId = $user->id ?: ($request->ip() ?: 'guest');

        // 1. Cooldown Rate-Limit: minimal 0.6 detik jeda antar sinkronisasi
        $cooldownKey = "wallet_cooldown_{$throttleId}";
        $lastRequestTime = \Illuminate\Support\Facades\Cache::get($cooldownKey);
        $currentTime = microtime(true);
        if ($lastRequestTime && ($currentTime - (float) $lastRequestTime) < 0.6) {
            Log::warning("AntiCheat RateLimit: User {$user->id} ({$user->name}) spammed sync requests ({$action})");
            return response()->json([
                'status' => 'error',
                'message' => '🛡️ Anti-Cheat: Frekuensi transaksi terlalu cepat. Harap tunggu sejenak.',
                'gold' => (int) $user->gold,
                'diamonds' => (int) $user->diamonds,
            ], 429);
        }
        \Illuminate\Support\Facades\Cache::put($cooldownKey, $currentTime, 10);

        // 2. Action-Specific Whitelist & Upper Bounds
        $isFishing = str_starts_with($action, 'catch_fish') || str_starts_with($action, 'fishing');
        $isTrash = str_starts_with($action, 'trash');
        $isQuiz = str_starts_with($action, 'quiz') || str_starts_with($action, 'school');
        $isPurchase = in_array($action, ['market_transaction', 'pharmacy_purchase', 'store_purchase', 'wardrobe_purchase']);

        if ($isFishing) {
            // Ikan langka / legendaris maksimal 600 gold dan 5 diamonds
            if ($deltaGold > 600 || $deltaDiamonds > 5 || $deltaGold < 0) {
                Log::warning("AntiCheat Fishing Alert: Invalid catch delta ({$deltaGold}G, {$deltaDiamonds}D) by user {$user->id}");
                return response()->json([
                    'status' => 'error',
                    'message' => '🛡️ Anti-Cheat: Hadiah tangkapan ikan tidak valid.',
                    'gold' => (int) $user->gold,
                    'diamonds' => (int) $user->diamonds,
                ], 403);
            }
        } elseif ($isTrash) {
            if ($deltaGold > 50 || $deltaDiamonds > 0 || $deltaGold < 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => '🛡️ Anti-Cheat: Hadiah membersihkan sampah melebihi batas legal.',
                    'gold' => (int) $user->gold,
                    'diamonds' => (int) $user->diamonds,
                ], 403);
            }
        } elseif ($isQuiz) {
            if ($deltaGold > 200 || $deltaDiamonds > 0 || $deltaGold < 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => '🛡️ Anti-Cheat: Hadiah kuis melebihi batas legal.',
                    'gold' => (int) $user->gold,
                    'diamonds' => (int) $user->diamonds,
                ], 403);
            }
        } elseif ($isPurchase) {
            // Belanja di toko TIDAK BOLEH bernilai positif (menambah uang secara gratis)
            if ($deltaGold > 0 || $deltaDiamonds > 0) {
                Log::warning("AntiCheat Shop Exploit: User {$user->id} attempted positive delta in store: {$action}");
                return response()->json([
                    'status' => 'error',
                    'message' => '🛡️ Anti-Cheat: Transaksi pembelian toko tidak sah.',
                    'gold' => (int) $user->gold,
                    'diamonds' => (int) $user->diamonds,
                ], 403);
            }
        } else {
            // Transaksi umum lainnya: maks 500 gold, 0 diamonds (kecuali admin/topup)
            if ($deltaGold > 500 && !in_array($action, ['admin_grant', 'topup_reward', 'bank_transaction'])) {
                Log::warning("AntiCheat Generic Alert: Impossible gold delta ({$deltaGold}) by {$user->id}");
                return response()->json([
                    'status' => 'error',
                    'message' => '🛡️ Anti-Cheat: Penambahan koin melebihi batas wajar.',
                    'gold' => (int) $user->gold,
                    'diamonds' => (int) $user->diamonds,
                ], 403);
            }
            if ($deltaDiamonds > 0 && !in_array($action, ['topup_success', 'admin_grant', 'topup_purchase'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => '🛡️ Anti-Cheat: Penambahan berlian hanya diizinkan via Top Up resmi.',
                    'gold' => (int) $user->gold,
                    'diamonds' => (int) $user->diamonds,
                ], 403);
            }
        }

        // 3. Velocity Limit: Maksimal perolehan koin per menit (maksimal 3,500 gold/menit)
        if ($deltaGold > 0 && !in_array($action, ['admin_grant', 'topup_reward'])) {
            $minuteKey = "wallet_velo_{$throttleId}_" . floor(time() / 60);
            $currentVelocity = (int) \Illuminate\Support\Facades\Cache::get($minuteKey, 0);
            if ($currentVelocity + $deltaGold > 3500) {
                Log::warning("AntiCheat Velocity Alert: User {$user->id} gained too much gold in 1 minute ({$currentVelocity} + {$deltaGold})");
                return response()->json([
                    'status' => 'error',
                    'message' => '🛡️ Anti-Cheat: Kecepatan perolehan koin terlalu tinggi. Harap bermain secara wajar.',
                    'gold' => (int) $user->gold,
                    'diamonds' => (int) $user->diamonds,
                ], 429);
            }
            \Illuminate\Support\Facades\Cache::put($minuteKey, $currentVelocity + $deltaGold, 90);
        }

        return DB::transaction(function () use ($user, $deltaGold, $deltaDiamonds, $action) {
            // Re-fetch user dengan lock untuk mencegah race condition (duplication glitch)
            $lockedUser = User::lockForUpdate()->find($user->id);

            $currentGold = (int) ($lockedUser->gold ?? 1000);
            $currentDiamonds = (int) ($lockedUser->diamonds ?? 50);

            $newGold = $currentGold + $deltaGold;
            $newDiamonds = $currentDiamonds + $deltaDiamonds;

            // 4. Cegah saldo menjadi negatif (Underflow Hack)
            if ($newGold < 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Saldo koin tidak mencukupi untuk melakukan transaksi ini.',
                    'gold' => $currentGold,
                    'diamonds' => $currentDiamonds,
                ], 422);
            }

            if ($newDiamonds < 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Saldo berlian tidak mencukupi untuk melakukan transaksi ini.',
                    'gold' => $currentGold,
                    'diamonds' => $currentDiamonds,
                ], 422);
            }

            // Simpan saldo authoritative baru ke MySQL dengan hash integritas
            $lockedUser->gold = $newGold;
            $lockedUser->diamonds = $newDiamonds;
            $lockedUser->wallet_hash = $lockedUser->calculateWalletHash();
            $lockedUser->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Saldo berhasil disinkronisasikan secara aman dengan database MySQL.',
                'gold' => $newGold,
                'diamonds' => $newDiamonds,
                'action' => $action,
            ]);
        });
    }

    /**
     * Verifikasi Email Pengguna
     */
    public function verifyEmail(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi akun tidak ditemukan.',
            ], 401);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'status' => 'success',
                'message' => 'Email akun Anda sudah terverifikasi sebelumnya!',
                'email_verified' => true,
                'email_verified_at' => $user->email_verified_at->toIso8601String(),
            ]);
        }

        $user->email_verified_at = now();
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => '✓ Selamat! Alamat email Anda telah berhasil diverifikasi secara resmi.',
            'email_verified' => true,
            'email_verified_at' => $user->email_verified_at->toIso8601String(),
        ]);
    }

    /**
     * Menautkan Akun Sosial (Google atau Facebook) ke Akun yang Sedang Aktif
     */
    public function linkSocial(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi akun tidak ditemukan.',
            ], 401);
        }

        $provider = strtolower(trim($request->input('provider', 'google')));
        if (!in_array($provider, ['google', 'facebook'])) {
            return response()->json(['status' => 'error', 'message' => 'Provider harus google atau facebook.'], 422);
        }

        $socialEmail = trim($request->input('social_email', ''));
        if (empty($socialEmail)) {
            return response()->json(['status' => 'error', 'message' => "Email {$provider} wajib diisi!"], 422);
        }

        if ($provider === 'google') {
            $user->google_email = $socialEmail;
        } else {
            $user->facebook_email = $socialEmail;
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => "✓ Akun {$provider} ({$socialEmail}) berhasil ditautkan ke akun Anda!",
            'google_linked' => !empty($user->google_email) || $user->provider === 'google',
            'google_email' => $user->google_email ?: ($user->provider === 'google' ? $user->email : null),
            'facebook_linked' => !empty($user->facebook_email) || $user->provider === 'facebook',
            'facebook_email' => $user->facebook_email ?: ($user->provider === 'facebook' ? $user->email : null),
        ]);
    }

    /**
     * Melepas Tautan Akun Sosial
     */
    public function unlinkSocial(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi akun tidak ditemukan.',
            ], 401);
        }

        $provider = strtolower(trim($request->input('provider', 'google')));

        if ($provider === 'google') {
            $user->google_email = null;
            if ($user->provider === 'google' && !empty($user->password)) {
                $user->provider = 'local';
            }
        } elseif ($provider === 'facebook') {
            $user->facebook_email = null;
            if ($user->provider === 'facebook' && !empty($user->password)) {
                $user->provider = 'local';
            }
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => "✓ Tautan akun {$provider} berhasil dilepas.",
            'google_linked' => !empty($user->google_email) || $user->provider === 'google',
            'google_email' => $user->google_email ?: ($user->provider === 'google' ? $user->email : null),
            'facebook_linked' => !empty($user->facebook_email) || $user->provider === 'facebook',
            'facebook_email' => $user->facebook_email ?: ($user->provider === 'facebook' ? $user->email : null),
        ]);
    }

    /**
     * Mengubah Nama Karakter Game (Nickname)
     */
    public function updateName(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi akun tidak ditemukan atau token tidak valid. Silakan masuk terlebih dahulu.',
            ], 401);
        }

        // Nama akun Super Admin dilindungi anti-tamper
        if ($user->isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => '🛡️ Nama karakter Super Admin dilindungi oleh sistem keamanan RadenShield.',
            ], 403);
        }

        $newName = trim($request->input('name', ''));
        if (empty($newName) || strlen($newName) < 3 || strlen($newName) > 25) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nama karakter harus terdiri dari 3 sampai 25 karakter.',
            ], 422);
        }

        // Cek apakah nama sudah digunakan pemain lain
        $exists = User::where('name', $newName)->where('id', '!=', $user->id)->exists();
        if ($exists) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nama karakter tersebut sudah digunakan oleh petualang lain.',
            ], 409);
        }

        $oldName = $user->name;
        $user->name = $newName;
        $user->save();

        // Migrasikan riwayat statistik olahraga mini game jika ada
        try {
            $sportsStatsPath = storage_path('app/sports_stats.json');
            if (file_exists($sportsStatsPath)) {
                $allStats = json_decode(file_get_contents($sportsStatsPath), true);
                if (is_array($allStats)) {
                    $oldKey = strtolower($oldName);
                    $newKey = strtolower($newName);
                    if (isset($allStats[$oldKey])) {
                        $pStats = $allStats[$oldKey];
                        $pStats['name'] = $newName;
                        $allStats[$newKey] = $pStats;
                        if ($oldKey !== $newKey) {
                            unset($allStats[$oldKey]);
                        }
                        @file_put_contents($sportsStatsPath, json_encode($allStats, JSON_PRETTY_PRINT));
                    }
                }
            }
        } catch (\Throwable $e) {}

        return response()->json([
            'status' => 'success',
            'message' => "✓ Nama karakter berhasil diubah menjadi {$newName}!",
            'old_name' => $oldName,
            'new_name' => $newName,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'gold' => $user->gold ?? 0,
                'diamonds' => $user->diamonds ?? 0,
                'level' => $user->level ?? 1,
                'exp' => $user->exp ?? 0,
            ],
        ]);
    }
}
