<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserFollow extends Model
{
    use HasFactory;

    protected $table = 'user_follows';

    protected $fillable = [
        'follower_name',
        'following_name',
    ];

    /**
     * Cek apakah $follower mengikuti $following
     */
    public static function isFollowing(string $follower, string $following): bool
    {
        $f1 = trim(strtolower($follower));
        $f2 = trim(strtolower($following));
        if ($f1 === '' || $f2 === '' || $f1 === $f2) {
            return false;
        }

        return static::where('follower_name', $f1)
            ->where('following_name', $f2)
            ->exists();
    }

    /**
     * Cek apakah kedua user saling mengikuti (Teman Resmi)
     */
    public static function isFriend(string $userA, string $userB): bool
    {
        return static::isFollowing($userA, $userB) && static::isFollowing($userB, $userA);
    }

    /**
     * Mulai mengikuti pemain lain
     */
    public static function follow(string $follower, string $following): array
    {
        $f1 = trim(strtolower($follower));
        $f2 = trim(strtolower($following));

        if ($f1 === '' || $f2 === '' || $f1 === $f2) {
            return [
                'success' => false,
                'message' => 'Tidak dapat mengikuti profil sendiri atau nama kosong.',
                'is_following' => false,
                'is_friend' => false,
            ];
        }

        static::firstOrCreate([
            'follower_name' => $f1,
            'following_name' => $f2,
        ]);

        $isMutual = static::where('follower_name', $f2)
            ->where('following_name', $f1)
            ->exists();

        return [
            'success' => true,
            'message' => $isMutual
                ? "Luar biasa! Kamu dan {$following} sekarang saling mengikuti dan menjadi Teman!"
                : "Kamu sekarang mengikuti {$following}.",
            'is_following' => true,
            'is_friend' => $isMutual,
        ];
    }

    /**
     * Berhenti mengikuti pemain lain (jika sebelumnya berteman, status teman otomatis gugur)
     */
    public static function unfollow(string $follower, string $following): array
    {
        $f1 = trim(strtolower($follower));
        $f2 = trim(strtolower($following));

        static::where('follower_name', $f1)
            ->where('following_name', $f2)
            ->delete();

        return [
            'success' => true,
            'message' => "Kamu telah berhenti mengikuti {$following}.",
            'is_following' => false,
            'is_friend' => false,
        ];
    }

    /**
     * Hapus pengikut tertentu
     */
    public static function removeFollower(string $userName, string $followerName): array
    {
        $target = trim(strtolower($userName));
        $follower = trim(strtolower($followerName));

        static::where('follower_name', $follower)
            ->where('following_name', $target)
            ->delete();

        return [
            'success' => true,
            'message' => "{$followerName} telah dihapus dari daftar pengikut.",
        ];
    }

    /**
     * Ambil daftar nama yang sedang diikuti (Following)
     */
    public static function getFollowingList(string $name): array
    {
        $key = trim(strtolower($name));
        if ($key === '') return [];

        return static::where('follower_name', $key)
            ->pluck('following_name')
            ->values()
            ->all();
    }

    /**
     * Ambil daftar nama pengikut (Followers)
     */
    public static function getFollowersList(string $name): array
    {
        $key = trim(strtolower($name));
        if ($key === '') return [];

        return static::where('following_name', $key)
            ->pluck('follower_name')
            ->values()
            ->all();
    }

    /**
     * Ambil daftar teman (Saling Mengikuti)
     */
    public static function getFriendsList(string $name): array
    {
        $following = static::getFollowingList($name);
        $followers = static::getFollowersList($name);

        return array_values(array_intersect($following, $followers));
    }

    /**
     * Ambil jumlah real Mengikuti, Pengikut, dan Teman
     */
    public static function getCounts(string $name): array
    {
        $following = static::getFollowingList($name);
        $followers = static::getFollowersList($name);
        $friends = array_values(array_intersect($following, $followers));

        return [
            'following_count' => count($following),
            'followers_count' => count($followers),
            'friends_count' => count($friends),
            'following' => $following,
            'followers' => $followers,
            'friends' => $friends,
        ];
    }
}
