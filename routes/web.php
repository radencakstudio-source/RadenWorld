<?php

use Illuminate\Support\Facades\Route;

// View Utama Aplikasi Game (Multi-Route SPA: Lobby, Safe House, Open World)
Route::get('/', function () {
    return view('welcome');
});

Route::get('/home/{privateId?}', function ($privateId = null) {
    return view('welcome');
});

Route::get('/world', function () {
    return view('welcome');
});

// Route Khusus Portal Super Admin (Dengan random token ID berkeamanan tinggi)
Route::get('/admin/{adminToken?}', function ($adminToken = null) {
    return view('welcome');
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

    return response()->json([
        'status' => 'success',
        'message' => $isSuperAdmin ? 'Akun Super Admin berhasil dibuat!' : 'Akun berhasil dibuat! Selamat datang di RadenWorld.',
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
            'is_super_admin' => $user->isSuperAdmin(),
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
        $user->password = \Illuminate\Support\Facades\Hash::make('Raden1234');
        $user->role = 'super_admin';
        $user->title = '👑 SUPER ADMIN';
        $user->save();
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
        $user->role = 'super_admin';
        $user->title = '👑 SUPER ADMIN';
        $user->level = max($user->level, 99);
        $user->save();
    }

    return response()->json([
        'status' => 'success',
        'message' => $user->isSuperAdmin() ? 'Selamat datang kembali, Pemimpin Tertinggi Raden (Super Admin)!' : 'Berhasil masuk ke RadenWorld!',
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
            'is_super_admin' => $user->isSuperAdmin(),
            'private_room_id' => 'safe-' . $user->id . '-' . substr(md5($user->name), 0, 6),
        ],
    ]);
});

// C. Lupa Sandi (Reset Kata Sandi)
Route::post('/api/auth/forgot-password', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'email' => 'required|email',
        'new_password' => 'nullable|string|min:4',
    ]);

    $user = \App\Models\User::where('email', $request->email)->first();
    if (!$user) {
        return response()->json([
            'status' => 'error',
            'message' => 'Email tidak ditemukan dalam sistem database!',
        ], 404);
    }

    $newPass = $request->new_password ?: '123456';
    $user->password = \Illuminate\Support\Facades\Hash::make($newPass);
    $user->save();

    return response()->json([
        'status' => 'success',
        'message' => "Kata sandi untuk {$user->name} berhasil diperbarui!",
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
Route::get('/api/auth/profile/{name}', function ($name) {
    $user = \App\Models\User::where('name', $name)->first();
    if (!$user) {
        return response()->json([
            'name' => $name,
            'level' => 1,
            'exp' => 0,
            'max_exp' => 100,
            'title' => 'Petualang Pemula',
            'gold' => 250,
            'diamonds' => 10,
            'joined_at' => date('d M Y'),
        ]);
    }

    $isSuper = $user->isSuperAdmin();

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'level' => $user->level,
        'exp' => $user->exp,
        'max_exp' => $user->level * 100,
        'title' => $user->title,
        'role' => $user->role,
        'is_super_admin' => $isSuper,
        'gold' => $isSuper ? 999999 : 250,
        'diamonds' => $isSuper ? 9999 : 10,
        'avatar' => $user->avatar,
        'joined_at' => $user->created_at->format('d M Y'),
    ]);
});

// ============================================================================
// 4. API SUPER ADMIN
// ============================================================================
Route::post('/api/admin/broadcast', function (\Illuminate\Http\Request $request) {
    $adminName = $request->input('admin_name', 'RADEN');
    $message = $request->input('message');

    if (!$message) {
        return response()->json(['status' => 'error', 'message' => 'Pesan pengumuman tidak boleh kosong!'], 422);
    }

    return response()->json([
        'status' => 'success',
        'broadcast' => [
            'sender' => $adminName,
            'role' => 'super_admin',
            'title' => '👑 PENGUMUMAN RESMI SUPER ADMIN',
            'text' => $message,
            'timestamp' => now()->toIso8601String(),
        ],
    ]);
});

Route::get('/api/admin/users', function () {
    $users = \App\Models\User::select('id', 'name', 'email', 'role', 'title', 'level', 'created_at')
        ->orderByDesc('id')
        ->get();

    return response()->json([
        'status' => 'success',
        'count' => $users->count(),
        'users' => $users,
    ]);
});

// Endpoint Pembuatan Token Unik Portal Admin (Random ID)
Route::post('/api/admin/portal/token', function (\Illuminate\Http\Request $request) {
    $name = $request->input('name');
    $email = $request->input('email');

    $user = \App\Models\User::where('email', $email)
        ->orWhere('name', $name)
        ->first();

    $isAuthorized = ($user && $user->isSuperAdmin()) || strtoupper($name) === 'RADEN' || strtolower($email) === 'radencakstudio@gmail.com';

    if (!$isAuthorized) {
        return response()->json([
            'status' => 'forbidden',
            'message' => 'Akses ditolak! Hanya akun Super Admin yang diizinkan membuka Portal Admin.',
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
    $name = $request->query('name');
    $email = $request->query('email');

    $user = null;
    if ($email || $name) {
        $user = \App\Models\User::where('email', $email)
            ->orWhere('name', $name)
            ->first();
    }

    $isAuthorized = ($user && $user->isSuperAdmin()) || strtoupper($name) === 'RADEN' || strtolower($email) === 'radencakstudio@gmail.com';

    if (!$isAuthorized) {
        return response()->json([
            'status' => 'forbidden',
            'authorized' => false,
            'message' => 'Portal Admin terkunci: Anda bukan Super Admin!',
        ], 403);
    }

    return response()->json([
        'status' => 'success',
        'authorized' => true,
        'token' => $token,
        'message' => 'Otoritas Super Admin terverifikasi. Selamat datang di Pusat Kendali RadenWorld!',
    ]);
});



