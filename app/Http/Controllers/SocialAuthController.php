<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Get OAuth configuration status for frontend
     */
    public function getConfig()
    {
        $googleClientId = config('services.google.client_id');
        $facebookClientId = config('services.facebook.client_id');

        return response()->json([
            'status' => 'success',
            'google' => [
                'configured' => !empty($googleClientId) && $googleClientId !== 'YOUR_GOOGLE_CLIENT_ID',
                'client_id' => $googleClientId ?: null,
            ],
            'facebook' => [
                'configured' => !empty($facebookClientId) && $facebookClientId !== 'YOUR_FACEBOOK_CLIENT_ID',
                'client_id' => $facebookClientId ?: null,
            ],
        ]);
    }

    /**
     * Redirect to OAuth Provider
     */
    public function redirect(string $provider)
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            return response()->json(['status' => 'error', 'message' => 'Provider tidak didukung.'], 400);
        }

        $clientId = config("services.{$provider}.client_id");
        $clientSecret = config("services.{$provider}.client_secret");

        if (empty($clientId) || empty($clientSecret) || $clientId === "YOUR_" . strtoupper($provider) . "_CLIENT_ID") {
            $providerName = ucfirst($provider);
            return response(
                "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Konfigurasi {$providerName} OAuth</title>" .
                "<style>body{background:#09090b;color:#f4f4f5;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;box-sizing:border-box;}" .
                ".card{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:28px;max-width:440px;text-align:center;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);}" .
                "h2{margin-top:0;color:#fbbf24;font-size:1.25rem;}p{font-size:0.9rem;line-height:1.5;color:#a1a1aa;}" .
                "code{background:#27272a;padding:2px 6px;border-radius:4px;color:#38bdf8;font-size:0.85rem;}" .
                "button{margin-top:16px;background:#f59e0b;color:#000;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;}" .
                "</style></head><body>" .
                "<div class='card'>" .
                "<h2>Konfigurasi {$providerName} OAuth</h2>" .
                "<p>Kredensial API <code>" . strtoupper($provider) . "_CLIENT_ID</code> belum disetel di berkas <code>.env</code>.</p>" .
                "<p>Gunakan tombol login langsung di game untuk masuk secara instan tanpa perlu API console!</p>" .
                "<button onclick='window.close()'>Tutup Jendela</button>" .
                "</div></body></html>"
            );
        }

        try {
            return Socialite::driver($provider)->stateless()->redirect();
        } catch (\Throwable $e) {
            return response("Error: " . $e->getMessage(), 500);
        }
    }

    /**
     * Handle OAuth Callback from Provider
     */
    public function callback(string $provider, Request $request)
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            return response("Provider tidak didukung", 400);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Throwable $e) {
            $err = htmlspecialchars($e->getMessage());
            return response(
                "<!DOCTYPE html><html><body>" .
                "<script>alert('Gagal autentikasi {$provider}: {$err}'); window.close();</script>" .
                "</body></html>",
                400
            );
        }

        $email = $socialUser->getEmail();
        $providerId = (string) $socialUser->getId();
        $name = $socialUser->getName() ?: $socialUser->getNickname() ?: ($provider . '_' . substr(md5($providerId), 0, 6));
        $avatarUrl = $socialUser->getAvatar();

        $user = $this->findOrCreateSocialUser($provider, $providerId, $email, $name, $avatarUrl);
        $userResponse = $this->buildUserResponse($user);
        $userJson = json_encode($userResponse);

        return response(
            "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Berhasil Masuk</title>" .
            "<style>body{background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}" .
            ".box{text-align:center;padding:30px;background:#171717;border-radius:12px;border:1px solid #333;}" .
            "</style></head><body>" .
            "<div class='box'><h3 style='color:#fbbf24;margin-top:0;'>Berhasil Masuk via " . ucfirst($provider) . "!</h3><p>Mengalihkan ke RadenWorld...</p></div>" .
            "<script>" .
            "  const userData = " . $userJson . ";" .
            "  if (window.opener) {" .
            "    window.opener.postMessage({ type: 'RADEN_SOCIAL_AUTH_SUCCESS', user: userData }, '*');" .
            "    window.close();" .
            "  } else {" .
            "    localStorage.setItem('raden_player_user', JSON.stringify(userData));" .
            "    window.location.href = '/';" .
            "  }" .
            "</script></body></html>"
        );
    }

    /**
     * Direct Social Verification & Login API
     * Supports:
     * - Google ID token JWT verification
     * - Facebook access token verification
     * - Direct social credential submission
     */
    public function verify(Request $request)
    {
        $data = $request->json()->all() ?: $request->all();

        $provider = strtolower($data['provider'] ?? 'google');
        if (!in_array($provider, ['google', 'facebook'])) {
            return response()->json(['status' => 'error', 'message' => 'Provider harus google atau facebook.'], 422);
        }

        $email = trim($data['email'] ?? '');
        $name = trim($data['name'] ?? '');
        $providerId = trim($data['provider_id'] ?? '');
        $avatarUrl = trim($data['avatar_url'] ?? '');
        $credential = trim($data['credential'] ?? ''); // Google JWT or FB token
        $gender = ($data['gender'] ?? 'male') === 'female' ? 'female' : 'male';

        // 1. Jika Google Credential (JWT) diberikan, coba verifikasi via Google tokeninfo
        if ($provider === 'google' && !empty($credential)) {
            try {
                $response = Http::timeout(3)->get("https://oauth2.googleapis.com/tokeninfo", [
                    'id_token' => $credential
                ]);

                if ($response->successful()) {
                    $googleData = $response->json();
                    if (!empty($googleData['email'])) {
                        $email = $googleData['email'];
                    }
                    if (!empty($googleData['name'])) {
                        $name = $googleData['name'];
                    }
                    if (!empty($googleData['sub'])) {
                        $providerId = (string) $googleData['sub'];
                    }
                    if (!empty($googleData['picture'])) {
                        $avatarUrl = $googleData['picture'];
                    }
                }
            } catch (\Throwable $e) {
                // Fallback jika tidak ada internet/timeout: gunakan payload dari request
                Log::warning("Google tokeninfo check skipped: " . $e->getMessage());
            }
        }

        // 2. Jika Facebook token diberikan, coba verifikasi via Graph API
        if ($provider === 'facebook' && !empty($credential)) {
            try {
                $response = Http::timeout(3)->get("https://graph.facebook.com/me", [
                    'fields' => 'id,name,email,picture.width(200).height(200)',
                    'access_token' => $credential
                ]);

                if ($response->successful()) {
                    $fbData = $response->json();
                    if (!empty($fbData['email'])) {
                        $email = $fbData['email'];
                    }
                    if (!empty($fbData['name'])) {
                        $name = $fbData['name'];
                    }
                    if (!empty($fbData['id'])) {
                        $providerId = (string) $fbData['id'];
                    }
                    if (!empty($fbData['picture']['data']['url'])) {
                        $avatarUrl = $fbData['picture']['data']['url'];
                    }
                }
            } catch (\Throwable $e) {
                Log::warning("FB Graph API check skipped: " . $e->getMessage());
            }
        }

        // Validasi minimal email atau identifier
        if (empty($email) && empty($name)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email atau nama akun sosial wajib diisi!'
            ], 422);
        }

        // Jika email kosong, buat fallback berdasarkan provider dan ID
        if (empty($email)) {
            $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($name));
            $email = ($cleanName ?: $provider) . '_' . ($providerId ?: rand(1000, 9999)) . '@' . $provider . '.com';
        }

        // Jika nama kosong, ambil dari username email
        if (empty($name)) {
            $name = explode('@', $email)[0];
        }

        try {
            $user = $this->findOrCreateSocialUser($provider, $providerId, $email, $name, $avatarUrl, $gender);
            $userResponse = $this->buildUserResponse($user);

            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil masuk dengan akun ' . ucfirst($provider) . '!',
                'user' => $userResponse,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan akun: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Find existing user or create a new persistent user in MySQL
     */
    private function findOrCreateSocialUser(
        string $provider,
        string $providerId,
        string $email,
        string $name,
        string $avatarUrl = '',
        string $gender = 'male'
    ): User {
        // Cek apakah ada user berdasarkan email
        $user = null;
        if (!empty($email)) {
            $user = User::where('email', $email)->first();
        }

        // Jika tidak ditemukan by email, cek by provider & provider_id
        if (!$user && !empty($providerId)) {
            $user = User::where('provider', $provider)->where('provider_id', $providerId)->first();
        }

        // Jika akun Raden Super Admin mencoba login via Google/FB dengan email admin
        $isAdminEmail = strtolower($email) === 'radencakstudio@gmail.com';

        if (!$user) {
            // Bersihkan nama agar ramah URL dan unik
            $baseName = preg_replace('/[^a-zA-Z0-9_]/', '', str_replace([' ', '.'], '_', $name));
            if (empty($baseName) || strlen($baseName) < 3) {
                $baseName = ucfirst($provider) . '_' . rand(1000, 9999);
            }

            // Pastikan username unik di DB
            $finalName = $baseName;
            $suffix = 1;
            while (User::where('name', $finalName)->exists()) {
                $finalName = $baseName . '_' . $suffix++;
            }

            $defaultAvatar = [
                'gender' => $gender,
                'skinColor' => '#fed7aa',
                'shirtColor' => $provider === 'google' ? '#ea4335' : '#1877f2',
                'pantsColor' => '#1e293b',
                'hatType' => $isAdminEmail ? 'crown' : 'none',
            ];

            $user = User::create([
                'name' => $isAdminEmail ? 'raden' : $finalName,
                'email' => $email,
                'birth_date' => '2000-01-01',
                'password' => null,
                'provider' => $provider,
                'provider_id' => $providerId ?: (string) rand(10000000, 99999999),
                'avatar' => $defaultAvatar,
                'avatar_url' => $avatarUrl ?: null,
                'level' => $isAdminEmail ? 99 : 1,
                'exp' => $isAdminEmail ? 9999 : 0,
                'title' => $isAdminEmail ? '👑 SUPER ADMIN' : ('Warga ' . ucfirst($provider)),
                'role' => $isAdminEmail ? 'super_admin' : 'user',
            ]);
        } else {
            // Update provider info & avatar URL jika sebelumnya belum ada
            $dirty = false;
            if (empty($user->provider) || $user->provider === 'local') {
                $user->provider = $provider;
                $dirty = true;
            }
            if (!empty($providerId) && empty($user->provider_id)) {
                $user->provider_id = $providerId;
                $dirty = true;
            }
            if (!empty($avatarUrl) && $user->avatar_url !== $avatarUrl) {
                $user->avatar_url = $avatarUrl;
                $dirty = true;
            }
            if ($isAdminEmail && $user->role !== 'super_admin') {
                $user->role = 'super_admin';
                $user->title = '👑 SUPER ADMIN';
                $dirty = true;
            }
            if ($dirty) {
                $user->save();
            }
        }

        return $user;
    }

    /**
     * Format standardized User array for game frontend & multiplayer
     */
    private function buildUserResponse(User $user): array
    {
        $likesFile = storage_path('app/player_likes.json');
        $likesMap = file_exists($likesFile) ? (json_decode(file_get_contents($likesFile), true) ?: []) : [];
        $isSuper = $user->isSuperAdmin();
        $likesCount = $likesMap[$user->name] ?? ($isSuper ? 99999999999 : 0);

        $months = [
            'Jan' => 'Jan', 'Feb' => 'Feb', 'Mar' => 'Mar', 'Apr' => 'Apr', 'May' => 'Mei', 'Jun' => 'Jun',
            'Jul' => 'Jul', 'Aug' => 'Ags', 'Sep' => 'Sep', 'Oct' => 'Okt', 'Nov' => 'Nov', 'Dec' => 'Des'
        ];
        $joinedDateStr = $user->created_at ? strtr($user->created_at->format('d M Y'), $months) : 'Warga RadenWorld';

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'birth_date' => $user->birth_date,
            'avatar' => $user->avatar,
            'avatar_url' => $user->avatar_url,
            'provider' => $user->provider ?? 'local',
            'level' => $user->level,
            'exp' => $user->exp,
            'title' => $user->title,
            'role' => $user->role,
            'gold' => $user->isSuperAdmin() ? 99999999999 : (int) ($user->gold ?? 1000),
            'diamonds' => $user->isSuperAdmin() ? 99999999999 : (int) ($user->diamonds ?? 50),
            'email_verified' => !empty($user->email_verified_at),
            'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toIso8601String() : null,
            'google_linked' => !empty($user->google_email) || $user->provider === 'google',
            'google_email' => $user->google_email ?: ($user->provider === 'google' ? $user->email : null),
            'facebook_linked' => !empty($user->facebook_email) || $user->provider === 'facebook',
            'facebook_email' => $user->facebook_email ?: ($user->provider === 'facebook' ? $user->email : null),
            'is_super_admin' => $user->isSuperAdmin(),
            'created_at' => $user->created_at ? $user->created_at->toIso8601String() : null,
            'joined_at' => $joinedDateStr,
            'likes' => $likesCount,
            'private_room_id' => 'safe-' . $user->id . '-' . substr(md5($user->name), 0, 6),
        ];
    }
}
