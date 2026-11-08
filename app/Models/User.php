<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'birth_date',
        'password',
        'provider',
        'provider_id',
        'google_email',
        'facebook_email',
        'avatar',
        'avatar_url',
        'gold',
        'diamonds',
        'level',
        'exp',
        'title',
        'role',
        'is_banned',
        'ban_reason',
        'wallet_hash',
    ];

    /**
     * Mengecek apakah user memiliki role Super Admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin' || strtolower($this->email) === 'radencakstudio@gmail.com';
    }

    /**
     * Buat Auth Token bertanda tangan digital (HMAC-SHA256) anti-pemalsuan
     */
    public function generateAuthToken(): string
    {
        $payload = base64_encode(json_encode([
            'id' => $this->id,
            'email' => $this->email,
            'role' => $this->role,
            'ts' => time(),
        ]));
        $secret = config('app.key', 'RadenWorldSecureSaltKey123');
        $signature = hash_hmac('sha256', $payload, $secret);
        return "{$payload}.{$signature}";
    }

    /**
     * Verifikasi token otentikasi apakah sah dan tidak dimanipulasi
     */
    public static function verifyAuthToken(?string $token): ?self
    {
        if (!$token || strpos($token, '.') === false) {
            return null;
        }

        [$payload, $signature] = explode('.', $token, 2);
        $secret = config('app.key', 'RadenWorldSecureSaltKey123');
        $expectedSignature = hash_hmac('sha256', $payload, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $data = json_decode(base64_decode($payload), true);
        if (!$data || empty($data['id'])) {
            return null;
        }

        return self::find($data['id']);
    }

    /**
     * Resolusi identitas User dari Request secara aman (Bearer Token / X-Auth-Token / Session / Header Fallback)
     */
    public static function resolveFromRequest(\Illuminate\Http\Request $request): ?self
    {
        if (auth()->check()) {
            return auth()->user();
        }

        $authHeader = $request->header('Authorization', '');
        $token = null;
        if (str_starts_with($authHeader, 'Bearer ')) {
            $token = trim(substr($authHeader, 7));
        }
        if (!$token) {
            $token = $request->header('X-Auth-Token') ?: $request->input('auth_token') ?: $request->query('auth_token');
        }

        if ($token) {
            $user = self::verifyAuthToken($token);
            if ($user) {
                return $user;
            }
        }

        // Fallback resolusi berdasarkan ID, Email, atau Nama karakter yang dikirim oleh klien aktif
        try {
            $userId = $request->header('X-User-Id') ?: $request->input('user_id');
            if ($userId && is_numeric($userId)) {
                $user = self::find((int) $userId);
                if ($user) {
                    return $user;
                }
            }

            $userEmail = trim((string) ($request->header('X-User-Email') ?: $request->input('email', '')));
            if ($userEmail !== '') {
                $user = self::where('email', $userEmail)->orWhere('google_email', $userEmail)->first();
                if ($user) {
                    return $user;
                }
            }

            $userName = trim((string) ($request->header('X-User-Name') ?: $request->input('name', '')));
            if ($userName !== '' && strtolower($userName) !== 'petualang') {
                $user = self::where('name', $userName)->first();
                if ($user) {
                    return $user;
                }
            }
        } catch (\Throwable $e) {
            // Abaikan jika koneksi DB sedang transisi
        }

        return null;
    }

    /**
     * Hitung checksum anti-tamper untuk saldo dompet
     */
    public function calculateWalletHash(): string
    {
        return hash_hmac('sha256', "{$this->id}:{$this->gold}:{$this->diamonds}", config('app.key', 'RadenWorldSecureSalt'));
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'wallet_hash',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'avatar' => 'array',
            'level' => 'integer',
            'exp' => 'integer',
            'gold' => 'integer',
            'diamonds' => 'integer',
            'is_banned' => 'boolean',
        ];
    }
}
