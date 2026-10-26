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
