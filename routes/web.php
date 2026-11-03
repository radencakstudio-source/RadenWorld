<?php

use Illuminate\Support\Facades\Route;

// View Utama Aplikasi Game (Multi-Route SPA: Lobby, Safe House, Open World)
Route::get('/', function () {
    return view('welcome');
});

Route::get('/home/{privateId?}', function ($privateId = null) {
    return view('welcome');
});

Route::get('/world/popup', function () {
    return redirect('/world');
});

Route::get('/world/{school?}', function ($school = null) {
    return view('welcome');
});

Route::get('/school/{type?}', function ($type = null) {
    return view('welcome');
});

Route::get('/cafe', function () {
    return view('welcome');
});

Route::get('/perpustakaan', function () {
    return view('welcome');
});

Route::get('/library', function () {
    return view('welcome');
});


// Route Portal Admin Dialihkan ke World
Route::get('/admin/{adminToken?}', function ($adminToken = null) {
    return redirect('/world');
});

// Dedicated fast ping endpoint for latency measurement
Route::get('/api/ping', function () {
    return response('pong', 200)
        ->header('Content-Type', 'text/plain')
        ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        ->header('Access-Control-Allow-Origin', '*');
});
Route::get('/ping', function () {
    return response('pong', 200)
        ->header('Content-Type', 'text/plain')
        ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        ->header('Access-Control-Allow-Origin', '*');
});

// ============================================================================
// API SEKOLAH (SD, SMP, SMA)
// ============================================================================
Route::get('/api/game/school/{type?}', function ($type = 'sd') {
    $schools = [
        'sd' => [
            'type' => 'sd',
            'name' => 'Sekolah Dasar (SD) RadenWorld',
            'grade_level' => 'Tingkat 1 - 6',
            'uniform' => 'Merah Putih',
            'colors' => [
                'light' => '#D70D0D',
                'dark' => '#570404',
            ],
            'teacher' => [
                'name' => 'Bu Guru Endang',
                'role' => 'Wali Kelas SD Teladan',
            ],
            'student' => [
                'name' => 'Budi Kecil',
                'role' => 'Murid Berprestasi SD (Merah Putih)',
            ],
            'facilities' => ['Ruang Kelas 1-6', 'Papan Tulis Whiteboard', 'Meja Guru', 'Vending Machine Susu', 'Pojok Membaca'],
        ],
        'smp' => [
            'type' => 'smp',
            'name' => 'Sekolah Menengah Pertama (SMP) RadenWorld',
            'grade_level' => 'Tingkat 7 - 9',
            'uniform' => 'Biru Putih',
            'colors' => [
                'light' => '#0DD7CA',
                'dark' => '#0C6125',
            ],
            'teacher' => [
                'name' => 'Pak Guru Haryanto',
                'role' => 'Guru IPA & Pembina OSIS SMP',
            ],
            'student' => [
                'name' => 'Rian Aditya',
                'role' => 'Ketua OSIS SMP (Biru Putih)',
            ],
            'facilities' => ['Laboratorium IPA', 'Ruang OSIS', 'Mading Sekolah', 'Vending Machine Minuman Segar', 'Meja Belajar Bersama'],
        ],
        'sma' => [
            'type' => 'sma',
            'name' => 'Sekolah Menengah Atas (SMA) RadenWorld',
            'grade_level' => 'Tingkat 10 - 12',
            'uniform' => 'Abu-abu Putih',
            'colors' => [
                'light' => '#FEFEFE',
                'dark' => '#00EAFF',
            ],
            'teacher' => [
                'name' => 'Ibu Dra. Ratna Dewi',
                'role' => 'Kepala Sekolah SMA Kebangsaan',
            ],
            'student' => [
                'name' => 'Dimas Alamsyah',
                'role' => 'Ketua Pramuka & Siswa XII (Abu-Abu Putih)',
            ],
            'facilities' => ['Ruang Kelas Persiapan UTBK', 'Pojok Literasi Digital', 'Meja Diskusi Kelompok', 'Vending Machine', 'Papan Informasi Beasiswa'],
        ],
    ];

    $selected = $schools[strtolower($type)] ?? $schools['sd'];
    return response()->json($selected);
});

// ============================================================================
// 1. API BERANDA (Home Screen API)
// Mengambil data versi game, berita pengumuman, dan status server game.
// ============================================================================
Route::get('/api/game/home', function () {
    return response()->json([
        'title' => 'RadenWorld',
        'subtitle' => '2D Open World Multiplayer RPG',
        'version' => '1.2.0',
        'engine' => 'Phaser 3 & PixiJS 8 (HTML5 2D Canvas/WebGL)',
        'server_status' => 'ONLINE',
        'available_servers' => [
            ['id' => 'RADEN-ASIA-01', 'name' => 'Asia Tenggara (Sanctuary)', 'ping' => '18ms'],
            ['id' => 'RADEN-ID-02', 'name' => 'Indonesia Barat (Nusantara)', 'ping' => '12ms'],
        ],
        'news' => 'Selamat datang di pembaruan sistem House & Open World!',
    ]);
});

// ============================================================================
// 2. API ROOM / HOUSE (Private Player Home API dengan Safe ID)
// Mengambil konfigurasi rumah pribadi: lemari pakaian, kasur, dapur, kamar mandi.
// ============================================================================
Route::get('/api/game/house/{privateId?}', function ($privateId = 'safe-01') {
    return response()->json([
        'room_id' => $privateId,
        'room_name' => 'Rumah Pribadi Karakter (' . $privateId . ')',
        'is_private' => true,
        'is_safe_zone' => true,
        'has_other_players' => false,
        'furniture' => [
            ['type' => 'wardrobe', 'name' => 'Lemari Pakaian', 'action' => 'Kustomisasi Avatar'],
            ['type' => 'bed', 'name' => 'Tempat Tidur', 'action' => 'Istirahat / Tidur'],
            ['type' => 'kitchen', 'name' => 'Dapur Memasak', 'action' => 'Memasak Makanan'],
            ['type' => 'bathroom', 'name' => 'Kamar Mandi', 'action' => 'Mandi & Bersihkan Diri'],
            ['type' => 'door', 'name' => 'Pintu Keluar', 'action' => 'Menuju ke Open World'],
        ],
    ]);
});

// ============================================================================
// 3. API WORLD (Open World API)
// Mengambil status server open world, zona kota Sanctuary Plaza, toko & NPC.
// ============================================================================
Route::get('/api/game/world', function () {
    return response()->json([
        'server_code' => 'RADEN-ASIA-01',
        'server_name' => 'Server Asia-Sanctuary #1',
        'world_size' => '3200x3200',
        'ground_theme' => 'Chessboard Dark & Light Grid',
        'landmarks' => [
            ['name' => 'Sanctuary Plaza', 'x' => 1600, 'y' => 1600],
            ['name' => 'Toko Senjata & Armor', 'x' => 1480, 'y' => 1520],
            ['name' => 'Toko Ramuan Alkimia', 'x' => 1720, 'y' => 1520],
            ['name' => 'Rumah Pemain', 'x' => 1520, 'y' => 1680],
            ['name' => 'Azure Mystic Lake', 'x' => 2400, 'y' => 800],
        ],
        'npc_list' => [
            ['name' => 'Sage Raden', 'role' => 'Tetua Desa', 'x' => 1660, 'y' => 1580],
            ['name' => 'Blacksmith Arya', 'role' => 'Pandai Besi', 'x' => 1480, 'y' => 1500],
            ['name' => 'Alchemist Sari', 'role' => 'Penjual Ramuan', 'x' => 1720, 'y' => 1500],
        ],
    ]);
});

// ============================================================================
// 4. API AUTENTIKASI AKUN NYATA (REAL ACCOUNT AUTH SYSTEM)
// ============================================================================


// A0. Kirim Kode OTP Verifikasi Email (6 Digit)
Route::post('/api/auth/send-otp', function (\Illuminate\Http\Request $request) {
    $email = strtolower(trim((string) $request->input('email', '')));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return response()->json([
            'status' => 'error',
            'message' => 'Format alamat email tidak valid.',
        ], 422);
    }

    $purpose = trim((string) $request->input('purpose', 'register'));
    $otpCode = (string) random_int(100000, 999999);
    $expiresAt = time() + (10 * 60); // 10 menit

    $otpFile = storage_path('app/email_otp_codes.json');
    $codes = file_exists($otpFile) ? (json_decode(file_get_contents($otpFile), true) ?: []) : [];
    $codes[$email] = [
        'code' => $otpCode,
        'expires_at' => $expiresAt,
        'purpose' => $purpose,
        'verified' => false,
        'sent_at' => date('Y-m-d H:i:s'),
    ];
    @file_put_contents($otpFile, json_encode($codes, JSON_PRETTY_PRINT));

    // Kirim email via Mail::raw
    try {
        \Illuminate\Support\Facades\Mail::raw("Kode OTP Verifikasi RadenWorld Anda adalah: {$otpCode}\n\nKode ini berlaku selama 10 menit. Masukkan kode ini pada halaman verifikasi.", function ($message) use ($email) {
            $message->to($email)->subject('Kode OTP Verifikasi Akun RadenWorld');
        });
    } catch (\Throwable $e) {
        \Illuminate\Support\Facades\Log::info("OTP untuk {$email}: {$otpCode}");
    }

    return response()->json([
        'status' => 'success',
        'message' => 'Kode OTP 6 digit berhasil dikirim ke ' . $email . '! Cek kotak masuk atau spam.',
        'debug_otp' => app()->environment('local') ? $otpCode : null,
    ]);
});

// A01. Verifikasi Kode OTP Email
Route::post('/api/auth/verify-otp', function (\Illuminate\Http\Request $request) {
    $email = strtolower(trim((string) $request->input('email', '')));
    $code = trim((string) $request->input('code', ''));

    $otpFile = storage_path('app/email_otp_codes.json');
    $codes = file_exists($otpFile) ? (json_decode(file_get_contents($otpFile), true) ?: []) : [];

    if (!isset($codes[$email])) {
        return response()->json([
            'status' => 'error',
            'message' => 'Belum ada permintaan OTP untuk email ini. Silakan klik tombol Kirim OTP.',
        ], 400);
    }

    $record = $codes[$email];
    if (time() > ($record['expires_at'] ?? 0)) {
        return response()->json([
            'status' => 'error',
            'message' => 'Kode OTP telah kadaluarsa (lebih dari 10 menit). Silakan minta kode baru.',
        ], 400);
    }

    if ((string) ($record['code'] ?? '') !== $code) {
        return response()->json([
            'status' => 'error',
            'message' => 'Kode OTP 6-digit salah. Silakan periksa kembali email Anda.',
        ], 400);
    }

    $codes[$email]['verified'] = true;
    @file_put_contents($otpFile, json_encode($codes, JSON_PRETTY_PRINT));

    return response()->json([
        'status' => 'success',
        'verified' => true,
        'message' => 'Email berhasil diverifikasi dengan OTP!',
    ]);
});

// A. Register Akun Baru

Route::post('/api/auth/register', function (\Illuminate\Http\Request $request) {
    $data = $request->json()->all() ?: $request->all();
    
    $validator = \Illuminate\Support\Facades\Validator::make($data, [
        'name' => 'required|string|max:50',
        'email' => 'required|string|max:100',
        'password' => 'required|string|min:4',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'message' => $validator->errors()->first(),
        ], 422);
    }

    $email = trim($data['email']);
    $name = trim($data['name']);
    $password = $data['password'];

    if (!\App\Models\UserFollow::isDatabaseAvailable()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Layanan database MySQL belum menyala di Laragon. Silakan klik "Start All" di aplikasi Laragon.',
        ], 503);
    }

    try {
        if (\App\Models\User::where('email', $email)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email ini sudah terdaftar! Silakan gunakan email lain atau langsung Masuk.',
            ], 422);
        }

        if (\App\Models\User::where('name', $name)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nama karakter ini sudah digunakan! Silakan pilih nama lain.',
            ], 422);
        }
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Koneksi ke database gagal: ' . $e->getMessage(),
        ], 503);
    }

    $defaultAvatar = [
        'gender' => 'male',
        'skinColor' => '#fed7aa',
        'shirtColor' => '#f59e0b',
        'pantsColor' => '#1e293b',
        'hatType' => 'none',
    ];

    $avatar = $data['avatar'] ?? $defaultAvatar;

    $isSuperAdmin = strtolower($email) === 'radencakstudio@gmail.com' || strtoupper($name) === 'RADEN';
    $role = $isSuperAdmin ? 'super_admin' : 'player';
    $title = $isSuperAdmin ? '👑 SUPER ADMIN' : 'Petualang Pemula';
    $level = $isSuperAdmin ? 99 : 1;
    $exp = $isSuperAdmin ? 9999 : 0;

    try {
        $user = \App\Models\User::create([
            'name' => $name,
            'email' => $email,
            'birth_date' => $data['birth_date'] ?? null,
            'password' => \Illuminate\Support\Facades\Hash::make($password),
            'avatar' => $avatar,
            'level' => $level,
            'exp' => $exp,
            'title' => $title,
            'role' => $role,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Gagal menyimpan akun baru: ' . $e->getMessage(),
        ], 500);
    }

    $months = [
        'Jan' => 'Jan', 'Feb' => 'Feb', 'Mar' => 'Mar', 'Apr' => 'Apr', 'May' => 'Mei', 'Jun' => 'Jun',
        'Jul' => 'Jul', 'Aug' => 'Ags', 'Sep' => 'Sep', 'Oct' => 'Okt', 'Nov' => 'Nov', 'Dec' => 'Des'
    ];
    $joinedDateStr = $user->created_at ? strtr($user->created_at->format('d M Y'), $months) : 'Warga RadenWorld';

    $authToken = $user->generateAuthToken();

    return response()->json([
        'status' => 'success',
        'message' => $isSuperAdmin ? 'Akun Super Admin berhasil dibuat!' : 'Akun berhasil dibuat! Selamat datang di RadenWorld.',
        'auth_token' => $authToken,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'birth_date' => $user->birth_date,
            'avatar' => $user->avatar,
            'level' => $user->level,
            'exp' => $user->exp,
            'title' => $user->title,
            'role' => $user->role,
            'auth_token' => $authToken,
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
            'likes' => $user->isSuperAdmin() ? 99999999999 : 0,
            'private_room_id' => 'safe-' . $user->id . '-' . substr(md5($user->name), 0, 6),
        ],
    ]);
});

// B. Login Akun Terdaftar
Route::post('/api/auth/login', function (\Illuminate\Http\Request $request) {
    $data = $request->json()->all() ?: $request->all();

    $validator = \Illuminate\Support\Facades\Validator::make($data, [
        'login' => 'required|string',
        'password' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'message' => $validator->errors()->first(),
        ], 422);
    }

    $login = trim($data['login']);
    $password = $data['password'];

    $isRadenSuperAdminAttempt = (strtolower($login) === 'radencakstudio@gmail.com' || strtolower($login) === 'raden') && $password === 'Raden1234';

    // Cek ketersediaan server MySQL (probe 50ms)
    if (!\App\Models\UserFollow::isDatabaseAvailable()) {
        if ($isRadenSuperAdminAttempt) {
            return response()->json([
                'status' => 'success',
                'message' => 'Selamat datang kembali, Pemimpin Tertinggi Raden (Mode Super Admin Offline)!',
                'user' => [
                    'id' => 1,
                    'name' => 'raden',
                    'email' => 'radencakstudio@gmail.com',
                    'birth_date' => '2004-08-16',
                    'avatar' => [
                        'gender' => 'male',
                        'skinColor' => '#fed7aa',
                        'shirtColor' => '#f59e0b',
                        'pantsColor' => '#0f172a',
                        'hatType' => 'crown',
                    ],
                    'level' => 99,
                    'exp' => 9999,
                    'title' => '👑 SUPER ADMIN',
                    'role' => 'super_admin',
                    'is_super_admin' => true,
                    'created_at' => now()->toIso8601String(),
                    'joined_at' => '11 Okt 2026',
                    'likes' => 99999999999,
                    'private_room_id' => 'safe-1-abfcb4',
                ],
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Layanan database MySQL belum menyala di Laragon. Silakan klik "Start All" di Laragon atau bermain sebagai Tamu.',
        ], 503);
    }

    try {
        $user = \App\Models\User::where('email', $login)
            ->orWhere('name', $login)
            ->first();

        // Khusus Akun Super Admin: jika belum ada di database, buat langsung
        if (!$user && (strtolower($login) === 'radencakstudio@gmail.com' || strtolower($login) === 'raden')) {
            $user = \App\Models\User::create([
                'name' => 'raden',
                'email' => 'radencakstudio@gmail.com',
                'birth_date' => '2004-08-16',
                'password' => \Illuminate\Support\Facades\Hash::make('Raden1234'),
                'role' => 'super_admin',
                'title' => '👑 SUPER ADMIN',
                'level' => 99,
                'exp' => 9999,
                'avatar' => [
                    'gender' => 'male',
                    'skinColor' => '#fed7aa',
                    'shirtColor' => '#f59e0b',
                    'pantsColor' => '#0f172a',
                    'hatType' => 'crown',
                ],
            ]);
        }
    } catch (\Throwable $e) {
        if ($isRadenSuperAdminAttempt) {
            return response()->json([
                'status' => 'success',
                'message' => 'Selamat datang kembali, Pemimpin Tertinggi Raden (Mode Super Admin Offline)!',
                'user' => [
                    'id' => 1,
                    'name' => 'raden',
                    'email' => 'radencakstudio@gmail.com',
                    'birth_date' => '2004-08-16',
                    'avatar' => [
                        'gender' => 'male',
                        'skinColor' => '#fed7aa',
                        'shirtColor' => '#f59e0b',
                        'pantsColor' => '#0f172a',
                        'hatType' => 'crown',
                    ],
                    'level' => 99,
                    'exp' => 9999,
                    'title' => '👑 SUPER ADMIN',
                    'role' => 'super_admin',
                    'is_super_admin' => true,
                    'created_at' => now()->toIso8601String(),
                    'joined_at' => '11 Okt 2026',
                    'likes' => 99999999999,
                    'private_room_id' => 'safe-1-abfcb4',
                ],
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Koneksi database terputus. Silakan klik "Start All" di Laragon atau bermain sebagai Tamu.',
        ], 503);
    }

    if (!$user) {
        return response()->json([
            'status' => 'error',
            'message' => 'Akun tidak ditemukan! Silakan periksa nama/email atau daftar akun baru.',
        ], 404);
    }

    $isSuperAdminAccount = strtolower($user->email) === 'radencakstudio@gmail.com' || strtoupper($user->name) === 'RADEN' || $user->role === 'super_admin';

    // Verifikasi kata sandi (dukung password Raden1234 untuk akun super admin)
    $passwordValid = \Illuminate\Support\Facades\Hash::check($password, $user->password);
    if (!$passwordValid && $isSuperAdminAccount && $password === 'Raden1234') {
        try {
            $user->password = \Illuminate\Support\Facades\Hash::make('Raden1234');
            $user->role = 'super_admin';
            $user->title = '👑 SUPER ADMIN';
            $user->save();
        } catch (\Throwable $e) {}
        $passwordValid = true;
    }

    if (!$passwordValid) {
        return response()->json([
            'status' => 'error',
            'message' => 'Kata sandi salah! Silakan periksa kembali kata sandi Anda.',
        ], 401);
    }

    // Pastikan status role super admin konsisten
    if ($isSuperAdminAccount && ($user->role !== 'super_admin' || $user->title !== '👑 SUPER ADMIN')) {
        try {
            $user->role = 'super_admin';
            $user->title = '👑 SUPER ADMIN';
            $user->level = max($user->level, 99);
            $user->save();
        } catch (\Throwable $e) {}
    }

    $likesFile = storage_path('app/player_likes.json');
    $likesMap = file_exists($likesFile) ? (json_decode(file_get_contents($likesFile), true) ?: []) : [];
    $isSuper = $user->isSuperAdmin();
    $likesCount = $likesMap[$user->name] ?? ($isSuper ? 99999999999 : 0);
    $months = [
        'Jan' => 'Jan', 'Feb' => 'Feb', 'Mar' => 'Mar', 'Apr' => 'Apr', 'May' => 'Mei', 'Jun' => 'Jun',
        'Jul' => 'Jul', 'Aug' => 'Ags', 'Sep' => 'Sep', 'Oct' => 'Okt', 'Nov' => 'Nov', 'Dec' => 'Des'
    ];
    $joinedDateStr = $user->created_at ? strtr($user->created_at->format('d M Y'), $months) : 'Warga RadenWorld';

    $authToken = $user->generateAuthToken();

    return response()->json([
        'status' => 'success',
        'message' => $user->isSuperAdmin() ? 'Selamat datang kembali, Pemimpin Tertinggi Raden (Super Admin)!' : 'Berhasil masuk ke RadenWorld!',
        'auth_token' => $authToken,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'birth_date' => $user->birth_date,
            'avatar' => $user->avatar,
            'level' => $user->level,
            'exp' => $user->exp,
            'title' => $user->title,
            'role' => $user->role,
            'auth_token' => $authToken,
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
        ],
    ]);
});

// B2. Autentikasi Sosial (Google & Facebook)
Route::get('/api/auth/social/config', [\App\Http\Controllers\SocialAuthController::class, 'getConfig']);
Route::get('/api/auth/social/{provider}/redirect', [\App\Http\Controllers\SocialAuthController::class, 'redirect']);
Route::get('/api/auth/social/{provider}/callback', [\App\Http\Controllers\SocialAuthController::class, 'callback']);
Route::post('/api/auth/social/verify', [\App\Http\Controllers\SocialAuthController::class, 'verify']);

// B3. Keamanan Akun & Saldo Authoritative Anti-Cheat
Route::get('/api/user/wallet', [\App\Http\Controllers\SecurityWalletController::class, 'getWallet']);
Route::post('/api/user/wallet/sync', [\App\Http\Controllers\SecurityWalletController::class, 'syncWallet']);
Route::post('/api/user/account/verify-email', [\App\Http\Controllers\SecurityWalletController::class, 'verifyEmail']);
Route::post('/api/user/account/link-social', [\App\Http\Controllers\SecurityWalletController::class, 'linkSocial']);
Route::post('/api/user/account/unlink-social', [\App\Http\Controllers\SecurityWalletController::class, 'unlinkSocial']);
Route::post('/api/user/account/update-name', [\App\Http\Controllers\SecurityWalletController::class, 'updateName']);

// C. Lupa Sandi (Reset Kata Sandi Terproteksi)
Route::post('/api/auth/forgot-password', function (\Illuminate\Http\Request $request) {
    $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
        'email' => 'required|email',
        'birth_date' => 'required|string',
        'new_password' => 'required|string|min:4',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'message' => $validator->errors()->first(),
        ], 422);
    }

    $email = trim($request->input('email'));
    $birthDate = trim($request->input('birth_date'));
    $newPassword = $request->input('new_password');

    $user = \App\Models\User::where('email', $email)->first();
    if (!$user) {
        return response()->json([
            'status' => 'error',
            'message' => 'Alamat email tidak ditemukan dalam database!',
        ], 404);
    }

    // Proteksi Super Admin: tidak dapat direset sembarangan
    if ($user->isSuperAdmin()) {
        return response()->json([
            'status' => 'error',
            'message' => '🛡️ Akun Super Admin dilindungi oleh protokol keamanan RadenShield dan tidak dapat direset melalui form publik.',
        ], 403);
    }

    // Validasi Tanggal Lahir Terdaftar (Identity Verification)
    if (!empty($user->birth_date) && $user->birth_date !== $birthDate) {
        return response()->json([
            'status' => 'error',
            'message' => 'Verifikasi gagal: Tanggal lahir tidak cocok dengan data pendaftaran akun!',
        ], 422);
    }

    $user->password = \Illuminate\Support\Facades\Hash::make($newPassword);
    $user->save();

    return response()->json([
        'status' => 'success',
        'message' => "Kata sandi untuk akun {$user->name} berhasil diperbarui! Silakan login dengan kata sandi baru.",
    ]);
});

// D. Simpan Avatar ke Database (dari Lemari Pakaian atau Kustomisasi)
Route::post('/api/auth/update-avatar', function (\Illuminate\Http\Request $request) {
    $user = null;
    if ($request->has('user_id')) {
        $user = \App\Models\User::find($request->user_id);
    } elseif ($request->has('name')) {
        $user = \App\Models\User::where('name', $request->name)->first();
    }

    if ($user && $request->has('avatar')) {
        $user->avatar = $request->avatar;
        $user->save();
        return response()->json([
            'status' => 'success',
            'message' => 'Avatar berhasil disimpan ke akun!',
            'avatar' => $user->avatar,
        ]);
    }

    return response()->json([
        'status' => 'success',
        'message' => 'Avatar diperbarui secara lokal.',
    ]);
});

// E. Dapatkan Profil Pemain Lengkap
// E. Dapatkan Profil Pemain Lengkap (Dengan Relasi Sosial Nyata dari Database)
Route::get('/api/auth/profile/{name}', function (\Illuminate\Http\Request $request, $name) {
    $targetName = trim($name);
    $viewerName = trim($request->input('viewer', ''));
    $clientIp = $request->ip() ?: '127.0.0.1';
    $today = date('Y-m-d');

    $likesFile = storage_path('app/player_likes.json');
    $likesMap = file_exists($likesFile) ? (json_decode(file_get_contents($likesFile), true) ?: []) : [];

    // Cek apakah penonton (viewer) sudah memberikan suka hari ini (Berdasarkan Nama Akun atau IP)
    $dailyLogFile = storage_path('app/player_daily_likes_log.json');
    $dailyLogs = file_exists($dailyLogFile) ? (json_decode(file_get_contents($dailyLogFile), true) ?: []) : [];
    $senderKey = strtolower($viewerName);
    $ipKey = "ip_{$clientIp}";
    $targetKey = strtolower($targetName);
    
    $hasLikedToday = ($senderKey !== '' && isset($dailyLogs[$today]["{$senderKey}-->{$targetKey}"]))
        || isset($dailyLogs[$today]["{$ipKey}-->{$targetKey}"]);

    // Hitung data relasi sosial asli dari database (Teman, Mengikuti, Pengikut)
    $socialCounts = \App\Models\UserFollow::getCounts($targetName);
    $isFollowing = false;
    $isFollower = false;
    $isFriend = false;

    if ($viewerName !== '') {
        $isFollowing = \App\Models\UserFollow::isFollowing($viewerName, $targetName);
        $isFollower = \App\Models\UserFollow::isFollowing($targetName, $viewerName);
        $isFriend = $isFollowing && $isFollower;
    }

    $months = [
        'Jan' => 'Jan', 'Feb' => 'Feb', 'Mar' => 'Mar', 'Apr' => 'Apr', 'May' => 'Mei', 'Jun' => 'Jun',
        'Jul' => 'Jul', 'Aug' => 'Ags', 'Sep' => 'Sep', 'Oct' => 'Okt', 'Nov' => 'Nov', 'Dec' => 'Des'
    ];

    $user = null;
    try {
        if (\App\Models\UserFollow::isDatabaseAvailable()) {
            $user = \App\Models\User::where('name', $targetName)
                ->orWhereRaw('LOWER(name) = ?', [strtolower(trim($targetName))])
                ->first();
        }
    } catch (\Throwable $e) {
        $user = null;
    }
    if (!$user) {
        $likesCount = $likesMap[$targetName] ?? 0;
        return response()->json([
            'name' => $targetName,
            'level' => 1,
            'exp' => 0,
            'max_exp' => 100,
            'title' => 'Petualang Pemula',
            'likes' => $likesCount,
            'has_liked_today' => $hasLikedToday,
            'gold' => 250,
            'diamonds' => 10,
            'joined_at' => 'Warga RadenWorld',
            'friends_count' => $socialCounts['friends_count'],
            'following_count' => $socialCounts['following_count'],
            'followers_count' => $socialCounts['followers_count'],
            'is_following' => $isFollowing,
            'is_follower' => $isFollower,
            'is_friend' => $isFriend,
            'friends' => $socialCounts['friends'],
            'following' => $socialCounts['following'],
            'followers' => $socialCounts['followers'],
        ]);
    }

    $isSuper = $user->isSuperAdmin();
    $likesCount = $likesMap[$user->name] ?? ($isSuper ? 99999999999 : 0);
    $formattedJoinedAt = $user->created_at ? strtr($user->created_at->format('d M Y'), $months) : 'Warga RadenWorld';

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'level' => $isSuper ? 99 : $user->level,
        'exp' => $user->exp,
        'max_exp' => $user->level * 100,
        'title' => $user->title,
        'role' => $user->role,
        'is_super_admin' => $isSuper,
        'likes' => $likesCount,
        'has_liked_today' => $hasLikedToday,
        'gold' => $isSuper ? 999999 : 250,
        'diamonds' => $isSuper ? 9999 : 10,
        'avatar' => $user->avatar,
        'joined_at' => $formattedJoinedAt,
        'friends_count' => $socialCounts['friends_count'], // Real database count, no 999 hardcode
        'following_count' => $socialCounts['following_count'], // Real database count
        'followers_count' => $socialCounts['followers_count'], // Real database count
        'is_following' => $isFollowing,
        'is_follower' => $isFollower,
        'is_friend' => $isFriend,
        'friends' => $socialCounts['friends'],
        'following' => $socialCounts['following'],
        'followers' => $socialCounts['followers'],
    ]);
});

// G. Dapatkan Hubungan Relasi Sosial Pemain (Teman, Mengikuti, Pengikut)
Route::get('/api/social/relations/{name}', function (\Illuminate\Http\Request $request, $name) {
    try {
        $targetName = trim($name);
        $viewerName = trim($request->input('viewer', ''));

        $data = \App\Models\UserFollow::getCounts($targetName);
        $isFollowing = false;
        $isFollower = false;
        $isFriend = false;

        if ($viewerName !== '') {
            $isFollowing = \App\Models\UserFollow::isFollowing($viewerName, $targetName);
            $isFollower = \App\Models\UserFollow::isFollowing($targetName, $viewerName);
            $isFriend = $isFollowing && $isFollower;
        }

        return response()->json([
            'name' => $targetName,
            'friends' => $data['friends'],
            'following' => $data['following'],
            'followers' => $data['followers'],
            'friends_count' => $data['friends_count'],
            'following_count' => $data['following_count'],
            'followers_count' => $data['followers_count'],
            'is_following' => $isFollowing,
            'is_follower' => $isFollower,
            'is_friend' => $isFriend,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'name' => $name,
            'friends' => [],
            'following' => [],
            'followers' => [],
            'friends_count' => 0,
            'following_count' => 0,
            'followers_count' => 0,
            'is_following' => false,
            'is_follower' => false,
            'is_friend' => false,
        ]);
    }
});

// H. Ikuti Pemain Lain (Follow / Saling Ikuti Jadi Teman)
Route::post('/api/social/follow', function (\Illuminate\Http\Request $request) {
    $senderName = trim($request->input('sender_name', ''));
    $targetName = trim($request->input('target_name', ''));

    if (!$senderName || !$targetName) {
        return response()->json([
            'status' => 'error',
            'message' => 'Nama pengirim dan target harus diisi.'
        ], 400);
    }

    if (strtolower($senderName) === strtolower($targetName)) {
        return response()->json([
            'status' => 'self_follow',
            'message' => 'Kamu tidak dapat mengikuti diri sendiri!'
        ], 400);
    }

    $result = \App\Models\UserFollow::follow($senderName, $targetName);
    $counts = \App\Models\UserFollow::getCounts($targetName);
    $senderCounts = \App\Models\UserFollow::getCounts($senderName);

    return response()->json([
        'status' => 'success',
        'message' => $result['message'],
        'is_following' => true,
        'is_friend' => $result['is_friend'],
        'target_counts' => $counts,
        'sender_counts' => $senderCounts,
    ]);
});

// I. Berhenti Mengikuti Pemain Lain (Unfollow / Hapus Pertemanan)
Route::post('/api/social/unfollow', function (\Illuminate\Http\Request $request) {
    $senderName = trim($request->input('sender_name', ''));
    $targetName = trim($request->input('target_name', ''));

    if (!$senderName || !$targetName) {
        return response()->json([
            'status' => 'error',
            'message' => 'Nama pengirim dan target harus diisi.'
        ], 400);
    }

    $result = \App\Models\UserFollow::unfollow($senderName, $targetName);
    $counts = \App\Models\UserFollow::getCounts($targetName);
    $senderCounts = \App\Models\UserFollow::getCounts($senderName);

    return response()->json([
        'status' => 'success',
        'message' => $result['message'],
        'is_following' => false,
        'is_friend' => false,
        'target_counts' => $counts,
        'sender_counts' => $senderCounts,
    ]);
});

// J. Hapus Pengikut
Route::post('/api/social/remove-follower', function (\Illuminate\Http\Request $request) {
    $userName = trim($request->input('user_name', ''));
    $followerName = trim($request->input('follower_name', ''));

    if (!$userName || !$followerName) {
        return response()->json([
            'status' => 'error',
            'message' => 'Nama user dan pengikut harus diisi.'
        ], 400);
    }

    $result = \App\Models\UserFollow::removeFollower($userName, $followerName);
    $userCounts = \App\Models\UserFollow::getCounts($userName);

    return response()->json([
        'status' => 'success',
        'message' => $result['message'],
        'user_counts' => $userCounts,
    ]);
});

// F. Berikan Like ke Profil Pemain (Maksimal 1 Kali Sehari & Bebas Spam)
Route::post('/api/auth/profile/{name}/like', function (\Illuminate\Http\Request $request, $name) {
    $targetName = trim($name);
    $senderName = trim($request->input('sender_name', ''));
    $clientIp = $request->ip() ?: '127.0.0.1';
    $today = date('Y-m-d');

    // 1. Validasi tidak boleh like diri sendiri jika nama sama
    if ($senderName !== '' && strtolower($senderName) === strtolower($targetName)) {
        return response()->json([
            'status' => 'self_like',
            'can_like' => false,
            'name' => $targetName,
            'message' => 'Kamu tidak dapat memberikan suka ke profilmu sendiri!'
        ], 400);
    }

    // 2. Baca dan bersihkan log harian (simpan maksimal 7 hari ke belakang)
    $dailyLogFile = storage_path('app/player_daily_likes_log.json');
    $dailyLogs = [];
    if (file_exists($dailyLogFile)) {
        $dailyLogs = json_decode(file_get_contents($dailyLogFile), true) ?: [];
    }

    $sevenDaysAgo = date('Y-m-d', strtotime('-7 days'));
    foreach (array_keys($dailyLogs) as $logDate) {
        if ($logDate < $sevenDaysAgo) {
            unset($dailyLogs[$logDate]);
        }
    }

    if (!isset($dailyLogs[$today]) || !is_array($dailyLogs[$today])) {
        $dailyLogs[$today] = [];
    }

    // 3. Kunci unik kombinasi pengirim dan penerima (Dual Check: Nama Akun + IP Address)
    $senderKey = strtolower($senderName);
    $ipKey = "ip_{$clientIp}";
    $targetKey = strtolower($targetName);
    $pairNameKey = $senderKey !== '' ? "{$senderKey}-->{$targetKey}" : null;
    $pairIpKey = "{$ipKey}-->{$targetKey}";

    // Baca data total like saat ini
    $likesFile = storage_path('app/player_likes.json');
    $likesMap = file_exists($likesFile) ? (json_decode(file_get_contents($likesFile), true) ?: []) : [];
    
    $targetUser = null;
    try {
        if (\App\Models\UserFollow::isDatabaseAvailable()) {
            $targetUser = \App\Models\User::where('name', $targetName)
                ->orWhereRaw('LOWER(name) = ?', [strtolower(trim($targetName))])
                ->first();
        }
    } catch (\Throwable $e) {
        $targetUser = null;
    }
    $isTargetSuper = $targetUser ? $targetUser->isSuperAdmin() : (strtoupper($targetName) === 'RADEN');
    $currentLikes = $likesMap[$targetName] ?? ($isTargetSuper ? 99999999999 : 0);

    // 4. Cegah spam: Cek apakah Nama Akun atau IP Address sudah like target hari ini
    $alreadyLiked = ($pairNameKey && isset($dailyLogs[$today][$pairNameKey])) || isset($dailyLogs[$today][$pairIpKey]);
    if ($alreadyLiked) {
        return response()->json([
            'status' => 'already_liked',
            'can_like' => false,
            'name' => $targetName,
            'likes' => $currentLikes,
            'has_liked_today' => true,
            'message' => "Kamu sudah memberikan suka ke {$targetName} hari ini. Kamu bisa memberikan suka lagi besok!"
        ], 200);
    }

    // 5. Catat log like harian untuk Nama Akun dan IP Address
    $logData = [
        'time' => date('H:i:s'),
        'sender' => $senderName ?: "ip_{$clientIp}",
        'target' => $targetName,
    ];
    if ($pairNameKey) {
        $dailyLogs[$today][$pairNameKey] = $logData;
    }
    $dailyLogs[$today][$pairIpKey] = $logData;
    @file_put_contents($dailyLogFile, json_encode($dailyLogs, JSON_PRETTY_PRINT));

    $newLikes = $isTargetSuper ? 99999999999 : ($currentLikes + 1);
    $likesMap[$targetName] = $newLikes;
    @file_put_contents($likesFile, json_encode($likesMap, JSON_PRETTY_PRINT));

    return response()->json([
        'status' => 'success',
        'can_like' => false,
        'has_liked_today' => true,
        'name' => $targetName,
        'likes' => $newLikes,
        'message' => "Kamu berhasil memberikan apresiasi suka ke {$targetName} untuk hari ini!"
    ]);
});


// ============================================================================
// 4. API SUPER ADMIN
// ============================================================================
Route::post('/api/admin/broadcast', function (\Illuminate\Http\Request $request) {
    $user = \App\Models\User::resolveFromRequest($request);
    if (!$user || !$user->isSuperAdmin()) {
        return response()->json([
            'status' => 'forbidden',
            'message' => 'Akses ditolak! Hanya akun Super Admin terverifikasi yang dapat menyiarkan pengumuman.',
        ], 403);
    }

    $message = $request->input('message');
    if (!$message) {
        return response()->json(['status' => 'error', 'message' => 'Pesan pengumuman tidak boleh kosong!'], 422);
    }

    return response()->json([
        'status' => 'success',
        'broadcast' => [
            'sender' => $user->name,
            'role' => 'super_admin',
            'title' => '👑 PENGUMUMAN RESMI SUPER ADMIN',
            'text' => $message,
            'timestamp' => now()->toIso8601String(),
        ],
    ]);
});

Route::get('/api/admin/users', function (\Illuminate\Http\Request $request) {
    $user = \App\Models\User::resolveFromRequest($request);
    if (!$user || !$user->isSuperAdmin()) {
        return response()->json([
            'status' => 'forbidden',
            'message' => 'Akses daftar pengguna ditolak! Hanya Super Admin yang berhak melihat data warga.',
        ], 403);
    }

    try {
        $users = \App\Models\User::select('id', 'name', 'email', 'role', 'title', 'level', 'created_at')
            ->orderByDesc('id')
            ->get();
    } catch (\Throwable $e) {
        $users = collect();
    }

    return response()->json([
        'status' => 'success',
        'count' => $users->count(),
        'users' => $users,
    ]);
});

// Endpoint Pembuatan Token Unik Portal Admin (Random ID)
Route::post('/api/admin/portal/token', function (\Illuminate\Http\Request $request) {
    $user = \App\Models\User::resolveFromRequest($request);
    if (!$user || !$user->isSuperAdmin()) {
        return response()->json([
            'status' => 'forbidden',
            'message' => 'Akses ditolak! Hanya akun Super Admin terotentikasi yang diizinkan membuka Portal Admin.',
        ], 403);
    }

    // Buat random token unik berkeamanan tinggi
    $randomToken = 'raden-' . bin2hex(random_bytes(6)) . '-' . substr(md5(uniqid()), 0, 8);

    return response()->json([
        'status' => 'success',
        'token' => $randomToken,
        'portal_url' => "/admin/{$randomToken}",
        'full_url' => url("/admin/{$randomToken}"),
    ]);
});

// Endpoint Verifikasi Keamanan Token Portal Admin
Route::get('/api/admin/portal/verify/{token}', function ($token, \Illuminate\Http\Request $request) {
    $user = \App\Models\User::resolveFromRequest($request);
    if (!$user || !$user->isSuperAdmin()) {
        return response()->json([
            'status' => 'forbidden',
            'authorized' => false,
            'message' => 'Portal Admin terkunci: Anda belum terotentikasi sebagai Super Admin!',
        ], 403);
    }

    return response()->json([
        'status' => 'success',
        'authorized' => true,
        'token' => $token,
        'message' => 'Otoritas Super Admin terverifikasi. Selamat datang di Pusat Kendali RadenWorld!',
    ]);
});

// Route SPA Gedung Sekolah (SD, SMP, SMA)
Route::get('/school/{type?}', function ($type = 'sd') {
    return view('welcome');
});

// ============================================================================
// API KOMPLEKS PENDIDIKAN (GEDUNG SD, SMP, SMA)
// ============================================================================
Route::get('/api/game/school/{type}', function ($type) {
    $normalized = strtolower(trim($type));

    $schools = [
        'sd' => [
            'type' => 'sd',
            'name' => 'Gedung Sekolah Dasar (SD)',
            'code' => 'RADEN-SD-01',
            'grade_levels' => 'Kelas 1 - Kelas 6 SD',
            'motto' => 'Cerdas, Berkarakter, dan Berbudi Pekerti Luhur',
            'floor_colors' => [
                'light' => '#D70D0D',
                'dark' => '#570404',
            ],
            'dimension' => [
                'grid_width' => 18,
                'grid_height' => 12,
                'tile_size' => 120,
            ],
            'facilities' => [
                'Ruang Kelas 1 - 6',
                'Perpustakaan Mini Ceria',
                'Papan Tulis Blackboard Interaktif',
                'Meja Guru & Siswa Rapi',
                'Vending Machine Minuman Segar',
            ],
            'npcs' => [
                ['name' => 'Bu Guru Endang', 'role' => 'Wali Kelas SD Teladan', 'location' => 'Meja Guru'],
                ['name' => 'Budi Santoso', 'role' => 'Ketua Murid Kelas 5 SD', 'location' => 'Baris Meja Depan'],
                ['name' => 'Siti Nurhaliza', 'role' => 'Siswa Teladan SD', 'location' => 'Baris Meja Belakang'],
            ],
        ],
        'smp' => [
            'type' => 'smp',
            'name' => 'Gedung Sekolah Menengah Pertama (SMP)',
            'code' => 'RADEN-SMP-02',
            'grade_levels' => 'Kelas 7 - Kelas 9 SMP',
            'motto' => 'Kreatif, Inovatif, dan Berdaya Saing Global',
            'floor_colors' => [
                'light' => '#0DD7CA',
                'dark' => '#0C6125',
            ],
            'dimension' => [
                'grid_width' => 18,
                'grid_height' => 12,
                'tile_size' => 120,
            ],
            'facilities' => [
                'Laboratorium Sains & Komputer',
                'Ruang Kelas 7 - 9',
                'Ruang OSIS SMP',
                'Perpustakaan Digital',
                'Vending Machine & Dispenser Sehat',
            ],
            'npcs' => [
                ['name' => 'Pak Guru Hartono', 'role' => 'Guru IPA & Pembina OSIS SMP', 'location' => 'Meja Guru'],
                ['name' => 'Dimas Pratama', 'role' => 'Ketua OSIS SMP', 'location' => 'Baris Meja Depan'],
                ['name' => 'Annisa Rahma', 'role' => 'Sekretaris Kelas 8', 'location' => 'Baris Meja Belakang'],
            ],
        ],
        'sma' => [
            'type' => 'sma',
            'name' => 'Gedung Sekolah Menengah Atas (SMA)',
            'code' => 'RADEN-SMA-03',
            'grade_levels' => 'Kelas 10 - Kelas 12 SMA',
            'motto' => 'Unggul dalam Prestasi, Mandiri, dan Pemimpin Masa Depan',
            'floor_colors' => [
                'light' => '#FEFEFE',
                'dark' => '#00EAFF',
            ],
            'dimension' => [
                'grid_width' => 18,
                'grid_height' => 12,
                'tile_size' => 120,
            ],
            'facilities' => [
                'Auditorium Akademik',
                'Laboratorium Fisika & Kimia Modern',
                'Lounge Diskusi & Studi Mandiri',
                'Ruang Bimbingan Karir & Kuliah',
                'Vending Machine Minuman Energi & Kopi',
            ],
            'npcs' => [
                ['name' => 'Drs. Supriyadi, M.Pd.', 'role' => 'Kepala Sekolah & Guru Fisika SMA', 'location' => 'Meja Guru'],
                ['name' => 'Reza Pahlevi', 'role' => 'Juara Olimpiade Sains Nasional', 'location' => 'Baris Meja Depan'],
                ['name' => 'Nadia Salsabila', 'role' => 'Ketua MPK & Duta Pelajar SMA', 'location' => 'Baris Meja Belakang'],
            ],
        ],
    ];

    if (!isset($schools[$normalized])) {
        return response()->json([
            'status' => 'error',
            'message' => 'Tipe sekolah tidak ditemukan. Pilih antara sd, smp, atau sma.',
        ], 404);
    }

    return response()->json([
        'status' => 'success',
        'data' => $schools[$normalized],
    ]);
});

// ============================================================================
// API CAFE & LOUNGE (RADEN CAFE)
// ============================================================================
Route::get('/api/game/cafe', function () {
    return response()->json([
        'status' => 'success',
        'data' => [
            'name' => 'Raden Cafe & Lounge',
            'code' => 'RADEN-CAFE-01',
            'category' => 'Kawasan Kuliner Barat',
            'room' => 'cafe',
            'description' => 'Tempat nongkrong santai nan mewah dengan sajian kopi Nusantara, pastry lezat, dan Wi-Fi kencang.',
            'barista' => [
                'name' => 'Barista Doni',
                'title' => 'Master Barista & Head of Cafe',
                'greeting' => 'Selamat datang di Raden Cafe! Mau pesan kopi panas atau minuman segar hari ini?',
            ],
            'menu' => [
                [
                    'id' => 'kopi_gayo',
                    'name' => 'Kopi Tubruk Gayo',
                    'category' => 'Kopi Panas',
                    'price' => 250,
                    'effect' => '+10 Stamina & Kecepatan Lari +5%',
                    'icon' => '☕',
                ],
                [
                    'id' => 'caramel_macchiato',
                    'name' => 'Iced Caramel Macchiato',
                    'category' => 'Minuman Dingin',
                    'price' => 350,
                    'effect' => '+25 Energi & Efek Mood Ceria',
                    'icon' => '🧊',
                ],
                [
                    'id' => 'croissant_butter',
                    'name' => 'Butter Croissant Premium',
                    'category' => 'Pastry',
                    'price' => 200,
                    'effect' => '+20 HP & Kenyamanan Maksimal',
                    'icon' => '🥐',
                ],
                [
                    'id' => 'donut_hazelnut',
                    'name' => 'Donat Cokelat Hazelnut',
                    'category' => 'Snack',
                    'price' => 150,
                    'effect' => '+15 EXP Manis',
                    'icon' => '🍩',
                ],
                [
                    'id' => 'teh_tarik',
                    'name' => 'Teh Tarik Nusantara',
                    'category' => 'Teh Tradisional',
                    'price' => 180,
                    'effect' => '+10 Relaksasi Pikiran',
                    'icon' => '🍵',
                ],
            ],
            'facilities' => [
                'Bar Counter Kayu Mewah',
                'Mesin Espresso Italia Modern',
                '8 Set Meja Diskusi & Karpet Amber',
                'Jukebox Klasik Pemutar Musik Jazz',
                'Vending Machine Minuman Otomatis',
                'Koneksi Internet Wi-Fi Cepat',
            ],
            'ambience' => [
                'music' => 'Lo-Fi Jazz Cafe Lounge',
                'lighting' => 'Warm Amber Glow',
            ],
        ],
    ]);
});

// ============================================================================
// API PERPUSTAKAAN KOTA (LIBRARY)
// ============================================================================
Route::get('/api/game/library', function () {
    return response()->json([
        'status' => 'success',
        'data' => [
            'name' => 'Perpustakaan Kota RadenWorld',
            'code' => 'RADEN-LIB-01',
            'category' => 'Kawasan Literasi & Akademik',
            'room' => 'library',
            'motto' => 'Jendela Ilmu, Menembus Cakrawala Dunia Tanpa Batas',
            'librarian' => [
                'name' => 'Ibu Siti Nurhaliza',
                'title' => 'Kepala Pustakawati Kota',
                'greeting' => 'Selamat datang di Perpustakaan Kota! Silakan pilih buku di rak SD, SMP, atau SMA untuk menambah wawasanmu.',
            ],
            'catalogs' => [
                'sd' => [
                    'title' => 'Koleksi Dasar Pelajar SD',
                    'books' => [
                        'Matematika Ceria: Perkalian, Pembagian & Pecahan',
                        'Petualangan Sains Cilik: Ekosistem Flora & Fauna',
                        'Bahasa Nusantara: Cerita Rakyat & Pantun Berbudi',
                    ],
                    'exp_reward' => 25,
                ],
                'smp' => [
                    'title' => 'Koleksi Menengah Pelajar SMP',
                    'books' => [
                        'Fisika Terapan: Gerak Lurus & Energi Terbarukan',
                        'Biologi Lingkungan: Sel, Genetika & Hutan Tropis',
                        'Sejarah Dunia & Jejak Kerajaan Maritim Nusantara',
                    ],
                    'exp_reward' => 50,
                ],
                'sma' => [
                    'title' => 'Koleksi Lanjutan Pelajar SMA',
                    'books' => [
                        'Kalkulus Lanjut & Aljabar Linear Komputasi',
                        'Kimia Organik Modern & Teknologi Polimer Ramah Lingkungan',
                        'Ekonomi Makro, Fiskal & Pasar Modal Digital',
                        'Strategi Menembus Seleksi Nasional UTBK-SNBT',
                    ],
                    'exp_reward' => 100,
                ],
            ],
            'facilities' => [
                'Rak Buku Kayu Jati Klasifikasi SD, SMP, SMA',
                'Meja Baca Panjang Berlampu Banker Hijau Antik',
                'Karpet Lorong Hijau Zamrud (Emerald Runner)',
                'Globe Antik & Alat Peraga Anatomi Tubuh',
                'Pojok Digital E-Library & Komputer Pencarian',
            ],
        ],
    ]);
});

// ============================================================================
// API PIXEL BILLBOARD 1920x1080 (/world/popup)
// ============================================================================
Route::get('/api/pixel-canvas/claims', function () {
    $host = request()->getHost();
    $isLocal = app()->environment('local') || $host === 'localhost' || $host === '127.0.0.1' || str_ends_with($host, '.test');
    if (!$isLocal) {
        return response()->json([
            'status' => 'maintenance',
            'message' => 'Layanan Pixel Billboard online sedang dalam tahap pemeliharaan (Maintenance).',
            'claims' => [],
            'price_per_pixel' => 500,
        ]);
    }

    $filePath = storage_path('app/pixel_canvas.json');
    if (file_exists($filePath)) {
        $content = json_decode(file_get_contents($filePath), true);
        if (is_array($content)) {
            return response()->json([
                'status' => 'success',
                'claims' => $content['claims'] ?? [],
                'price_per_pixel' => $content['price_per_pixel'] ?? 500,
            ]);
        }
    }

    return response()->json([
        'status' => 'success',
        'claims' => [],
        'price_per_pixel' => 500,
    ]);
});

Route::post('/api/pixel-canvas/claims', function (\Illuminate\Http\Request $request) {
    $host = request()->getHost();
    $isLocal = app()->environment('local') || $host === 'localhost' || $host === '127.0.0.1' || str_ends_with($host, '.test');
    if (!$isLocal) {
        return response()->json([
            'status' => 'maintenance',
            'message' => 'Layanan Pixel Billboard online sedang dalam tahap pemeliharaan (Maintenance).',
        ]);
    }
    $filePath = storage_path('app/pixel_canvas.json');
    $data = ['claims' => [], 'price_per_pixel' => 500];
    if (file_exists($filePath)) {
        $existing = json_decode(file_get_contents($filePath), true);
        if (is_array($existing)) {
            $data = $existing;
        }
    }

    $newClaim = $request->input('claim');
    if ($newClaim && is_array($newClaim)) {
        if (!isset($data['claims']) || !is_array($data['claims'])) {
            $data['claims'] = [];
        }

        // Cek jika ID sudah ada maka update, jika tidak append
        $found = false;
        foreach ($data['claims'] as $i => $c) {
            if (isset($c['id']) && isset($newClaim['id']) && $c['id'] === $newClaim['id']) {
                $data['claims'][$i] = $newClaim;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $data['claims'][] = $newClaim;
        }

        @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));
    }

    return response()->json([
        'status' => 'success',
        'claims' => $data['claims'],
        'price_per_pixel' => $data['price_per_pixel'] ?? 500,
    ]);
});

Route::post('/api/pixel-canvas/settings', function (\Illuminate\Http\Request $request) {
    $filePath = storage_path('app/pixel_canvas.json');
    $data = ['claims' => [], 'price_per_pixel' => 500];
    if (file_exists($filePath)) {
        $existing = json_decode(file_get_contents($filePath), true);
        if (is_array($existing)) {
            $data = $existing;
        }
    }

    $price = $request->input('price_per_pixel');
    if (is_numeric($price) && $price > 0) {
        $data['price_per_pixel'] = intval($price);
        @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));
    }

    return response()->json([
        'status' => 'success',
        'price_per_pixel' => $data['price_per_pixel'],
    ]);
});

Route::post('/api/pixel-canvas/reset', function () {
    $filePath = storage_path('app/pixel_canvas.json');
    $data = ['claims' => [], 'price_per_pixel' => 500];
    @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));

    return response()->json([
        'status' => 'success',
        'message' => 'Seluruh kanvas iklan telah dikosongkan.',
    ]);
});

// ============================================================================
// LEADERBOARD TIAP KELAS (KELAS 1-12) & TIAP SEKOLAH (SD, SMP, SMA)
// ============================================================================
$loadOrSeedSchoolLeaderboards = function (): array {
    $filePath = storage_path('app/school_leaderboards.json');
    if (file_exists($filePath)) {
        $decoded = json_decode((string) file_get_contents($filePath), true);
        if (is_array($decoded) && isset($decoded['classes']) && is_array($decoded['classes'])) {
            return $decoded;
        }
    }

    $classDefs = [
        'sd-1' => ['school' => 'sd', 'label' => 'Kelas 1 SD', 'students' => [
            ['Alya Putri', 1840, 3920, 3, 18, 'Matematika'],
            ['Budi Santoso', 1680, 3100, 2, 17, 'Semua Mapel'],
            ['Citra Kirana', 1520, 2890, 2, 16, 'Bahasa Indonesia'],
            ['Daffa Pratama', 1340, 1340, 1, 14, 'IPAS'],
            ['Eka Saputra', 1120, 1120, 1, 12, 'Pendidikan Pancasila'],
        ]],
        'sd-2' => ['school' => 'sd', 'label' => 'Kelas 2 SD', 'students' => [
            ['Farhan Rizki', 1920, 4120, 3, 19, 'Matematika'],
            ['Gita Nirmala', 1740, 3300, 2, 17, 'Semua Mapel'],
            ['Hana Safitri', 1580, 1580, 1, 16, 'Bahasa Indonesia'],
            ['Indra Wijaya', 1390, 2450, 2, 14, 'IPAS'],
            ['Joko Susilo', 1180, 1180, 1, 12, 'Pendidikan Pancasila'],
        ]],
        'sd-3' => ['school' => 'sd', 'label' => 'Kelas 3 SD', 'students' => [
            ['Kirana Dewi', 1980, 4680, 3, 19, 'IPAS'],
            ['Luthfi Hakim', 1760, 3420, 2, 18, 'Matematika'],
            ['Maya Sari', 1600, 1600, 1, 16, 'Semua Mapel'],
            ['Naufal Azhar', 1420, 2600, 2, 15, 'Bahasa Indonesia'],
            ['Olivia Natasya', 1240, 1240, 1, 13, 'Pendidikan Pancasila'],
        ]],
        'sd-4' => ['school' => 'sd', 'label' => 'Kelas 4 SD', 'students' => [
            ['Putra Ramadhan', 2040, 5120, 3, 19, 'Semua Mapel'],
            ['Qori Amalia', 1820, 3550, 2, 18, 'IPAS'],
            ['Rafi Ahmad', 1640, 3120, 2, 17, 'Matematika'],
            ['Sinta Bella', 1480, 1480, 1, 15, 'Bahasa Indonesia'],
            ['Tegar Prakoso', 1260, 1260, 1, 13, 'Pendidikan Pancasila'],
        ]],
        'sd-5' => ['school' => 'sd', 'label' => 'Kelas 5 SD', 'students' => [
            ['Umar Faruq', 2100, 5600, 3, 20, 'Matematika'],
            ['Vina Panduwinata', 1880, 3680, 2, 18, 'IPAS'],
            ['Wahyu Setiawan', 1700, 3200, 2, 17, 'Semua Mapel'],
            ['Yuni Shara', 1500, 1500, 1, 15, 'Bahasa Indonesia'],
            ['Zaki Mubarak', 1300, 1300, 1, 13, 'Pendidikan Pancasila'],
        ]],
        'sd-6' => ['school' => 'sd', 'label' => 'Kelas 6 SD', 'students' => [
            ['Bagas Adi', 2180, 6240, 4, 20, 'Semua Mapel'],
            ['Tiara Andini', 1960, 3890, 2, 19, 'Matematika'],
            ['Rizky Nazar', 1780, 3400, 2, 18, 'IPAS'],
            ['Nabila Syakieb', 1560, 1560, 1, 16, 'Bahasa Indonesia'],
            ['Fajar Sadboy', 1320, 1320, 1, 14, 'Pendidikan Pancasila'],
        ]],
        'smp-1' => ['school' => 'smp', 'label' => 'Kelas 7 SMP', 'students' => [
            ['Rian Aditya', 2120, 5980, 3, 20, 'IPA'],
            ['Aurelia Maharani', 1940, 3800, 2, 19, 'Matematika'],
            ['Bima Arya', 1720, 3310, 2, 17, 'Bahasa Inggris'],
            ['Chelsea Islan', 1540, 1540, 1, 16, 'IPS'],
            ['Kevin Sanjaya', 1360, 1360, 1, 14, 'PPKn'],
        ]],
        'smp-2' => ['school' => 'smp', 'label' => 'Kelas 8 SMP', 'students' => [
            ['Nadia Vega', 2200, 6450, 4, 20, 'Matematika'],
            ['Galih Permana', 1980, 3910, 2, 19, 'IPA'],
            ['Ratna Galih', 1760, 3420, 2, 18, 'Semua Mapel'],
            ['Yoga Pratama', 1580, 1580, 1, 16, 'Bahasa Inggris'],
            ['Salsaabila', 1380, 1380, 1, 14, 'IPS'],
        ]],
        'smp-3' => ['school' => 'smp', 'label' => 'Kelas 9 SMP', 'students' => [
            ['Arjuna Wiwaha', 2280, 7100, 4, 20, 'Semua Mapel'],
            ['Dewi Sartika', 2060, 4120, 2, 19, 'IPA'],
            ['Fikri Haikal', 1840, 3600, 2, 18, 'Matematika'],
            ['Larasati Putri', 1620, 1620, 1, 16, 'Bahasa Indonesia'],
            ['Reza Rahadian', 1420, 1420, 1, 15, 'PPKn'],
        ]],
        'sma-1' => ['school' => 'sma', 'label' => 'Kelas 10 SMA', 'students' => [
            ['Bintang Kejora', 2220, 6320, 3, 20, 'Fisika'],
            ['Maudy Ayunda', 2080, 4150, 2, 19, 'Matematika'],
            ['Jerome Polin', 1960, 3890, 2, 19, 'Kimia'],
            ['Sherina Munaf', 1720, 1720, 1, 17, 'Biologi'],
            ['Iqbaal Ramadhan', 1540, 1540, 1, 16, 'Ekonomi'],
        ]],
        'sma-2' => ['school' => 'sma', 'label' => 'Kelas 11 SMA', 'students' => [
            ['Cinta Laura', 2300, 6980, 4, 20, 'Bahasa Inggris'],
            ['Nicholas Saputra', 2140, 4280, 2, 20, 'Fisika'],
            [' Tasya Kamila', 1920, 3760, 2, 19, 'Kimia'],
            ['Angga Yunanda', 1700, 1700, 1, 17, 'Sosiologi'],
            ['Prilly Latuconsina', 1520, 1520, 1, 15, 'Ekonomi'],
        ]],
        'sma-3' => ['school' => 'sma', 'label' => 'Kelas 12 SMA', 'students' => [
            ['Dimas Alamsyah', 2380, 7840, 4, 20, 'Semua Mapel'],
            ['Gita Savitri', 2200, 4400, 2, 20, 'Kimia'],
            ['Najwa Shihab', 2040, 4080, 2, 19, 'Sosiologi'],
            [' Raditya Dika', 1800, 1800, 1, 18, 'Bahasa Indonesia'],
            ['Afgan Syahreza', 1600, 1600, 1, 16, 'Matematika'],
        ]],
    ];

    $classes = [];
    $now = now()->toIso8601String();
    foreach ($classDefs as $cKey => $meta) {
        $classes[$cKey] = [];
        foreach ($meta['students'] as $s) {
            $classes[$cKey][] = [
                'name' => trim($s[0]),
                'classKey' => $cKey,
                'classLabel' => $meta['label'],
                'school' => $meta['school'],
                'bestScore' => (int) $s[1],
                'totalScore' => (int) $s[2],
                'quizzesPlayed' => (int) $s[3],
                'bestCorrect' => (int) $s[4],
                'accuracy' => min(100, (int) round(($s[4] / 20) * 100)),
                'subject' => $s[5],
                'updatedAt' => $now,
            ];
        }
    }

    $seeded = ['classes' => $classes];
    @file_put_contents($filePath, json_encode($seeded, JSON_PRETTY_PRINT));
    return $seeded;
};

$buildLeaderboardResponse = function (array $store, string $schoolType, int $grade) {
    $school = in_array($schoolType, ['sd', 'smp', 'sma'], true) ? $schoolType : 'sd';
    $maxGrade = $school === 'sd' ? 6 : 3;
    $clampedGrade = max(1, min($maxGrade, $grade));
    $classKey = "{$school}-{$clampedGrade}";

    $classes = $store['classes'] ?? [];
    $rawEntries = $classes[$classKey] ?? [];
    
    // Prioritaskan pemain nyata (isReal: true) di atas bot/seed
    $realClassEntries = [];
    $mockClassEntries = [];
    foreach ($rawEntries as $entry) {
        if (!empty($entry['isReal'])) {
            $realClassEntries[] = $entry;
        } else {
            $mockClassEntries[] = $entry;
        }
    }
    usort($realClassEntries, function ($a, $b) {
        if (($b['bestScore'] ?? 0) !== ($a['bestScore'] ?? 0)) {
            return ($b['bestScore'] ?? 0) <=> ($a['bestScore'] ?? 0);
        }
        return ($b['totalScore'] ?? 0) <=> ($a['totalScore'] ?? 0);
    });
    // Jika ada pemain real, tampilkan pemain real secara eksklusif agar genuine Juara Kelas
    if (count($realClassEntries) > 0) {
        $classEntries = array_slice($realClassEntries, 0, 30);
    } else {
        usort($mockClassEntries, function ($a, $b) {
            return ($b['bestScore'] ?? 0) <=> ($a['bestScore'] ?? 0);
        });
        $classEntries = array_slice($mockClassEntries, 0, 10);
    }

    // Aggregate school-wide leaderboard across all classes of $school
    $buildSchoolBoard = function (string $targetSchool) use ($classes): array {
        $byPlayer = [];
        foreach ($classes as $cKey => $list) {
            if (!str_starts_with($cKey, $targetSchool . '-') || !is_array($list)) {
                continue;
            }
            foreach ($list as $row) {
                $pKey = strtolower(trim((string) ($row['name'] ?? 'Siswa')));
                if (!isset($byPlayer[$pKey])) {
                    $byPlayer[$pKey] = $row;
                } else {
                    $byPlayer[$pKey]['totalScore'] = (int) ($byPlayer[$pKey]['totalScore'] ?? 0) + (int) ($row['totalScore'] ?? 0);
                    $byPlayer[$pKey]['quizzesPlayed'] = (int) ($byPlayer[$pKey]['quizzesPlayed'] ?? 0) + (int) ($row['quizzesPlayed'] ?? 0);
                    if ((int) ($row['bestScore'] ?? 0) >= (int) ($byPlayer[$pKey]['bestScore'] ?? 0)) {
                        $byPlayer[$pKey]['bestScore'] = (int) ($row['bestScore'] ?? 0);
                        $byPlayer[$pKey]['bestCorrect'] = max((int) ($byPlayer[$pKey]['bestCorrect'] ?? 0), (int) ($row['bestCorrect'] ?? 0));
                        $byPlayer[$pKey]['accuracy'] = max((int) ($byPlayer[$pKey]['accuracy'] ?? 0), (int) ($row['accuracy'] ?? 0));
                        $byPlayer[$pKey]['classKey'] = $row['classKey'] ?? $cKey;
                        $byPlayer[$pKey]['classLabel'] = $row['classLabel'] ?? strtoupper($cKey);
                        $byPlayer[$pKey]['subject'] = $row['subject'] ?? 'Semua Mapel';
                    }
                }
            }
        }
        $unified = array_values($byPlayer);
        $realSchoolEntries = [];
        $mockSchoolEntries = [];
        foreach ($unified as $entry) {
            if (!empty($entry['isReal'])) {
                $realSchoolEntries[] = $entry;
            } else {
                $mockSchoolEntries[] = $entry;
            }
        }
        if (count($realSchoolEntries) > 0) {
            usort($realSchoolEntries, function ($a, $b) {
                if (($b['bestScore'] ?? 0) !== ($a['bestScore'] ?? 0)) {
                    return ($b['bestScore'] ?? 0) <=> ($a['bestScore'] ?? 0);
                }
                return ($b['totalScore'] ?? 0) <=> ($a['totalScore'] ?? 0);
            });
            return array_slice($realSchoolEntries, 0, 30);
        }
        usort($mockSchoolEntries, function ($a, $b) {
            if (($b['bestScore'] ?? 0) !== ($a['bestScore'] ?? 0)) {
                return ($b['bestScore'] ?? 0) <=> ($a['bestScore'] ?? 0);
            }
            return ($b['totalScore'] ?? 0) <=> ($a['totalScore'] ?? 0);
        });
        return array_slice($mockSchoolEntries, 0, 30);
    };

    $schoolBoard = $buildSchoolBoard($school);
    $schoolsOverview = [];
    foreach (['sd' => 'SD RadenWorld', 'smp' => 'SMP RadenWorld', 'sma' => 'SMA RadenWorld'] as $sCode => $sTitle) {
        $sb = $sCode === $school ? $schoolBoard : $buildSchoolBoard($sCode);
        $totalSchoolPts = array_reduce($sb, fn($carry, $item) => $carry + (int) ($item['totalScore'] ?? 0), 0);
        $schoolsOverview[$sCode] = [
            'school' => $sCode,
            'schoolTitle' => $sTitle,
            'studentCount' => count($sb),
            'totalSchoolPoints' => $totalSchoolPts,
            'champion' => $sb[0] ?? null,
            'entries' => $sb,
        ];
    }

    return [
        'status' => 'success',
        'school' => $school,
        'grade' => $clampedGrade,
        'classKey' => $classKey,
        'classLeaderboard' => $classEntries,
        'schoolLeaderboard' => $schoolBoard,
        'schoolsOverview' => $schoolsOverview,
    ];
};

Route::get('/api/game/leaderboard', function (\Illuminate\Http\Request $request) use ($loadOrSeedSchoolLeaderboards, $buildLeaderboardResponse) {
    $school = strtolower(trim((string) $request->query('school', 'sd')));
    $grade = (int) $request->query('grade', 1);
    $store = $loadOrSeedSchoolLeaderboards();
    return response()->json($buildLeaderboardResponse($store, $school, $grade));
});

Route::post('/api/game/leaderboard/submit', function (\Illuminate\Http\Request $request) use ($loadOrSeedSchoolLeaderboards, $buildLeaderboardResponse) {
    $data = $request->json()->all() ?: $request->all();
    $playerName = trim((string) ($data['player_name'] ?? 'Siswa Tamu'));
    if ($playerName === '') {
        $playerName = 'Siswa Tamu';
    }
    $playerName = mb_substr($playerName, 0, 40);

    $school = strtolower(trim((string) ($data['school_type'] ?? 'sd')));
    if (!in_array($school, ['sd', 'smp', 'sma'], true)) {
        $school = 'sd';
    }
    $maxGrade = $school === 'sd' ? 6 : 3;
    $grade = max(1, min($maxGrade, (int) ($data['grade'] ?? 1)));
    $classKey = "{$school}-{$grade}";
    $classLabel = $school === 'sd'
        ? "Kelas {$grade} SD"
        : ($school === 'smp' ? 'Kelas ' . ($grade + 6) . ' SMP' : 'Kelas ' . ($grade + 9) . ' SMA');

    $score = max(0, min(10000, (int) ($data['score'] ?? 0)));
    $totalQuestions = max(1, min(50, (int) ($data['total_questions'] ?? 20)));
    $correctCount = max(0, min($totalQuestions, (int) ($data['correct_count'] ?? 0)));
    $accuracy = (int) round(($correctCount / $totalQuestions) * 100);
    $subject = mb_substr(trim((string) ($data['subject'] ?? 'Semua Mapel')), 0, 40) ?: 'Semua Mapel';

    $store = $loadOrSeedSchoolLeaderboards();
    if (!isset($store['classes'][$classKey]) || !is_array($store['classes'][$classKey])) {
        $store['classes'][$classKey] = [];
    }

    $foundIdx = null;
    foreach ($store['classes'][$classKey] as $idx => $entry) {
        if (strtolower(trim((string) ($entry['name'] ?? ''))) === strtolower($playerName)) {
            $foundIdx = $idx;
            break;
        }
    }

    $now = now()->toIso8601String();
    if ($foundIdx !== null) {
        $prev = $store['classes'][$classKey][$foundIdx];
        $isNewBest = $score >= (int) ($prev['bestScore'] ?? 0);
        $store['classes'][$classKey][$foundIdx] = [
            'name' => $playerName,
            'classKey' => $classKey,
            'classLabel' => $classLabel,
            'school' => $school,
            'bestScore' => max((int) ($prev['bestScore'] ?? 0), $score),
            'totalScore' => (int) ($prev['totalScore'] ?? 0) + $score,
            'quizzesPlayed' => (int) ($prev['quizzesPlayed'] ?? 0) + 1,
            'bestCorrect' => max((int) ($prev['bestCorrect'] ?? 0), $correctCount),
            'accuracy' => $isNewBest ? $accuracy : max((int) ($prev['accuracy'] ?? 0), $accuracy),
            'subject' => $isNewBest ? $subject : ($prev['subject'] ?? $subject),
            'updatedAt' => $now,
        ];
    } else {
        $store['classes'][$classKey][] = [
            'name' => $playerName,
            'classKey' => $classKey,
            'classLabel' => $classLabel,
            'school' => $school,
            'bestScore' => $score,
            'totalScore' => $score,
            'quizzesPlayed' => 1,
            'bestCorrect' => $correctCount,
            'accuracy' => $accuracy,
            'subject' => $subject,
            'updatedAt' => $now,
        ];
    }

    $filePath = storage_path('app/school_leaderboards.json');
    @file_put_contents($filePath, json_encode($store, JSON_PRETTY_PRINT));

    return response()->json($buildLeaderboardResponse($store, $school, $grade));
});






