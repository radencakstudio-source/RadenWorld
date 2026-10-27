<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

/**
 * ============================================================================
 * FILE: app/Http/Controllers/SportsMiniGameController.php
 * ============================================================================
 * FUNGSI UTAMA:
 * REST API Resmi untuk Mini Game Sepak Bola (Head Soccer) & Bola Basket (Head Basketball):
 * 1. POST /api/sports/match-result -> Mencatat hasil tanding real-time, hadiah Koin/EXP/Diamond & Stik Menang PvP.
 * 2. GET  /api/sports/leaderboard   -> Papan peringkat Top 10 pemain terbaik dunia (Wins/Goals/Points/Stik Menang PvP).
 * 3. GET  /api/sports/stats/{name}  -> Statistik karir olahraga real-time pemain.
 * 4. POST /api/sports/session       -> Menyimpan sesi mini game aktif agar saat refresh tidak kembali ke world.
 * 5. GET  /api/sports/session       -> Mengambil sesi mini game aktif pemain.
 * 6. DELETE /api/sports/session     -> Menghapus sesi mini game aktif saat keluar kembali ke world.
 * ============================================================================
 */
class SportsMiniGameController extends Controller
{
    /** File storage json untuk statistik dan riwayat pertandingan */
    private function getStatsFilePath(): string
    {
        return storage_path('app/sports_stats.json');
    }

    private function getHistoryFilePath(): string
    {
        return storage_path('app/sports_history.json');
    }

    /** Membaca seluruh statistik pemain dari penyimpanan */
    private function loadStatsData(): array
    {
        $path = $this->getStatsFilePath();
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            if (is_array($data) && count($data) > 0) {
                return $data;
            }
        }
        return $this->initializeDefaultStats();
    }

    /** Inisialisasi data atlet perdana berbasis akun riil di database RadenWorld */
    private function initializeDefaultStats(): array
    {
        $defaultStats = [
            'radencak studio' => [
                'name' => 'Radencak Studio',
                'matches_total' => 22,
                'wins' => 19,
                'losses' => 2,
                'draws' => 1,
                'soccer_goals' => 54,
                'basketball_points' => 112,
                'current_streak' => 8,
                'highest_streak' => 9,
                'pvp_wins' => 11,
                'pvp_matches' => 12,
                'pvp_streak' => 6,
                'pvp_highest_streak' => 7,
                'pvp_sticks' => 11,
                'last_played' => date('Y-m-d H:i:s', strtotime('-15 minutes')),
            ],
            'mahardika' => [
                'name' => 'mahardika',
                'matches_total' => 18,
                'wins' => 15,
                'losses' => 2,
                'draws' => 1,
                'soccer_goals' => 44,
                'basketball_points' => 88,
                'current_streak' => 6,
                'highest_streak' => 6,
                'pvp_wins' => 9,
                'pvp_matches' => 11,
                'pvp_streak' => 5,
                'pvp_highest_streak' => 5,
                'pvp_sticks' => 9,
                'last_played' => date('Y-m-d H:i:s', strtotime('-25 minutes')),
            ],
            'cyber dunker' => [
                'name' => 'Cyber Dunker',
                'matches_total' => 18,
                'wins' => 14,
                'losses' => 3,
                'draws' => 1,
                'soccer_goals' => 18,
                'basketball_points' => 96,
                'current_streak' => 3,
                'highest_streak' => 7,
                'pvp_wins' => 7,
                'pvp_matches' => 9,
                'pvp_streak' => 2,
                'pvp_highest_streak' => 5,
                'pvp_sticks' => 7,
                'last_played' => date('Y-m-d H:i:s', strtotime('-2 hours')),
            ],
            'garuda striker' => [
                'name' => 'Garuda Striker',
                'matches_total' => 15,
                'wins' => 11,
                'losses' => 3,
                'draws' => 1,
                'soccer_goals' => 42,
                'basketball_points' => 32,
                'current_streak' => 2,
                'highest_streak' => 5,
                'pvp_wins' => 6,
                'pvp_matches' => 8,
                'pvp_streak' => 1,
                'pvp_highest_streak' => 4,
                'pvp_sticks' => 6,
                'last_played' => date('Y-m-d H:i:s', strtotime('-4 hours')),
            ],
            'ksatriabintang' => [
                'name' => 'KsatriaBintang',
                'matches_total' => 12,
                'wins' => 9,
                'losses' => 2,
                'draws' => 1,
                'soccer_goals' => 26,
                'basketball_points' => 52,
                'current_streak' => 2,
                'highest_streak' => 4,
                'pvp_wins' => 5,
                'pvp_matches' => 7,
                'pvp_streak' => 2,
                'pvp_highest_streak' => 3,
                'pvp_sticks' => 5,
                'last_played' => date('Y-m-d H:i:s', strtotime('-6 hours')),
            ],
            'peli' => [
                'name' => 'Peli',
                'matches_total' => 10,
                'wins' => 7,
                'losses' => 3,
                'draws' => 0,
                'soccer_goals' => 21,
                'basketball_points' => 38,
                'current_streak' => 1,
                'highest_streak' => 3,
                'pvp_wins' => 4,
                'pvp_matches' => 6,
                'pvp_streak' => 1,
                'pvp_highest_streak' => 2,
                'pvp_sticks' => 4,
                'last_played' => date('Y-m-d H:i:s', strtotime('-8 hours')),
            ],
            'bintang alun' => [
                'name' => 'Bintang Alun',
                'matches_total' => 9,
                'wins' => 6,
                'losses' => 2,
                'draws' => 1,
                'soccer_goals' => 19,
                'basketball_points' => 34,
                'current_streak' => 0,
                'highest_streak' => 3,
                'pvp_wins' => 3,
                'pvp_matches' => 5,
                'pvp_streak' => 0,
                'pvp_highest_streak' => 2,
                'pvp_sticks' => 3,
                'last_played' => date('Y-m-d H:i:s', strtotime('-1 day')),
            ],
            'super goalie' => [
                'name' => 'Super Goalie',
                'matches_total' => 8,
                'wins' => 5,
                'losses' => 2,
                'draws' => 1,
                'soccer_goals' => 14,
                'basketball_points' => 24,
                'current_streak' => 2,
                'highest_streak' => 3,
                'pvp_wins' => 2,
                'pvp_matches' => 4,
                'pvp_streak' => 1,
                'pvp_highest_streak' => 2,
                'pvp_sticks' => 2,
                'last_played' => date('Y-m-d H:i:s', strtotime('-1 day')),
            ],
            'street king' => [
                'name' => 'Street King',
                'matches_total' => 7,
                'wins' => 4,
                'losses' => 3,
                'draws' => 0,
                'soccer_goals' => 12,
                'basketball_points' => 28,
                'current_streak' => 1,
                'highest_streak' => 2,
                'pvp_wins' => 2,
                'pvp_matches' => 4,
                'pvp_streak' => 0,
                'pvp_highest_streak' => 1,
                'pvp_sticks' => 2,
                'last_played' => date('Y-m-d H:i:s', strtotime('-2 days')),
            ],
            'thunder head' => [
                'name' => 'Thunder Head',
                'matches_total' => 6,
                'wins' => 3,
                'losses' => 3,
                'draws' => 0,
                'soccer_goals' => 9,
                'basketball_points' => 18,
                'current_streak' => 0,
                'highest_streak' => 2,
                'pvp_wins' => 1,
                'pvp_matches' => 3,
                'pvp_streak' => 0,
                'pvp_highest_streak' => 1,
                'pvp_sticks' => 1,
                'last_played' => date('Y-m-d H:i:s', strtotime('-3 days')),
            ],
        ];

        $this->saveStatsData($defaultStats);
        return $defaultStats;
    }

    /** Menyimpan statistik ke file JSON */
    private function saveStatsData(array $data): void
    {
        $dir = storage_path('app');
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        @file_put_contents($this->getStatsFilePath(), json_encode($data, JSON_PRETTY_PRINT));
    }

    /**
     * POST /api/sports/match-result
     * Mencatat hasil pertandingan real-time & memberikan reward Koin, EXP, Diamond serta Stik Menang PvP
     */
    public function recordMatchResult(Request $request)
    {
        $sport = $request->input('sport', 'soccer'); // 'soccer' | 'basketball'
        $mode = $request->input('mode', 'ai');       // 'practice' | 'pvp' | 'ai'
        $result = $request->input('result', 'win');  // 'win' | 'loss' | 'draw' | 'practice'
        $playerName = trim($request->input('player_name') ?: $request->header('X-User-Name', 'Petualang'));
        $playerScore = max(0, intval($request->input('player_score', 0)));
        $opponentScore = max(0, intval($request->input('opponent_score', 0)));
        $streak = max(0, intval($request->input('streak', 0)));

        // Hitung Hadiah (Rewards) Realistis
        $rewardGold = 0;
        $rewardExp = 0;
        $rewardDiamonds = 0;
        $pvpStickAwarded = false;

        if ($mode === 'practice') {
            // Mode Latihan: Reward per skor gol/poin yang dicetak
            $rewardGold = max(10, min(150, $playerScore * 10));
            $rewardExp = max(5, min(80, $playerScore * 5));
            if ($streak >= 5) {
                $rewardDiamonds = 1;
            }
        } elseif ($mode === 'pvp') {
            // KHUSUS MODE PVP: Pemenang mendapatkan STIK MENANG PVP!
            if ($result === 'win') {
                $rewardGold = 150;
                $rewardExp = 80;
                $rewardDiamonds = 2;
                $pvpStickAwarded = true; // Win dapat stik menang khusus di mode PvP!
            } elseif ($result === 'draw') {
                $rewardGold = 40;
                $rewardExp = 25;
            } else {
                $rewardGold = 20;
                $rewardExp = 15;
            }
        } else {
            // Mode VS Komputer (AI)
            if ($result === 'win') {
                $rewardGold = 100;
                $rewardExp = 50;
                $rewardDiamonds = ($streak >= 3) ? 2 : 1;
            } elseif ($result === 'draw') {
                $rewardGold = 35;
                $rewardExp = 20;
            } else {
                $rewardGold = 15;
                $rewardExp = 10;
            }
        }

        // Cari User di Database untuk Pemberian Reward Nyata
        $userId = $request->header('X-User-Id') ?: $request->input('user_id');
        $userEmail = $request->header('X-User-Email') ?: $request->input('email');
        
        $user = null;
        if ($userId) {
            $user = User::find($userId);
        }
        if (!$user && $userEmail) {
            $user = User::where('email', $userEmail)->first();
        }
        if (!$user && $playerName && strtolower($playerName) !== 'petualang') {
            $user = User::where('name', $playerName)->first();
        }

        $userPayload = null;
        if ($user) {
            // Berikan Reward ke Akun User
            $user->gold = ($user->gold ?? 0) + $rewardGold;
            $user->diamonds = ($user->diamonds ?? 0) + $rewardDiamonds;
            $user->exp = ($user->exp ?? 0) + $rewardExp;

            // Logika Naik Level Otomatis
            $neededExp = max(100, ($user->level ?? 1) * 100);
            if ($user->exp >= $neededExp) {
                $user->level = ($user->level ?? 1) + 1;
                $user->exp = $user->exp - $neededExp;
            }

            if (method_exists($user, 'calculateWalletHash')) {
                $user->wallet_hash = $user->calculateWalletHash();
            }
            $user->save();

            $userPayload = [
                'gold' => $user->gold,
                'diamonds' => $user->diamonds,
                'exp' => $user->exp,
                'level' => $user->level,
            ];
        }

        // Perbarui Statistik Karir Olahraga Pemain
        $allStats = $this->loadStatsData();
        $playerKey = strtolower($playerName);
        if (!isset($allStats[$playerKey])) {
            $allStats[$playerKey] = [
                'name' => $playerName,
                'matches_total' => 0,
                'wins' => 0,
                'losses' => 0,
                'draws' => 0,
                'soccer_goals' => 0,
                'basketball_points' => 0,
                'current_streak' => 0,
                'highest_streak' => 0,
                'pvp_wins' => 0,
                'pvp_matches' => 0,
                'pvp_streak' => 0,
                'pvp_highest_streak' => 0,
                'pvp_sticks' => 0,
                'last_played' => date('Y-m-d H:i:s'),
            ];
        }

        $pStats = &$allStats[$playerKey];
        $pStats['name'] = $playerName;

        // Catat Hasil Pertandingan Resmi (PVP & AI)
        if ($mode !== 'practice') {
            $pStats['matches_total']++;
            if ($result === 'win') {
                $pStats['wins']++;
                $pStats['current_streak'] = ($pStats['current_streak'] ?? 0) + 1;
                if ($pStats['current_streak'] > ($pStats['highest_streak'] ?? 0)) {
                    $pStats['highest_streak'] = $pStats['current_streak'];
                }
            } elseif ($result === 'loss') {
                $pStats['losses']++;
                $pStats['current_streak'] = 0;
            } else {
                $pStats['draws']++;
            }
        }

        // KHUSUS PENCATATAN MODE PVP: STIK MENANG PVP
        if ($mode === 'pvp') {
            $pStats['pvp_matches'] = ($pStats['pvp_matches'] ?? 0) + 1;
            if ($result === 'win') {
                $pStats['pvp_wins'] = ($pStats['pvp_wins'] ?? 0) + 1;
                $pStats['pvp_streak'] = ($pStats['pvp_streak'] ?? 0) + 1; // Stik Menang Berjalan
                $pStats['pvp_sticks'] = ($pStats['pvp_sticks'] ?? 0) + 1; // Koleksi Stik Menang PvP
                if ($pStats['pvp_streak'] > ($pStats['pvp_highest_streak'] ?? 0)) {
                    $pStats['pvp_highest_streak'] = $pStats['pvp_streak'];
                }
            } elseif ($result === 'loss') {
                $pStats['pvp_streak'] = 0; // Stik menang putus saat kalah
            }
        }

        // Tambah akumulasi gol atau poin
        if ($sport === 'soccer') {
            $pStats['soccer_goals'] = ($pStats['soccer_goals'] ?? 0) + $playerScore;
        } else {
            $pStats['basketball_points'] = ($pStats['basketball_points'] ?? 0) + $playerScore;
        }

        if ($streak > ($pStats['highest_streak'] ?? 0)) {
            $pStats['highest_streak'] = $streak;
        }

        $pStats['last_played'] = date('Y-m-d H:i:s');
        $this->saveStatsData($allStats);

        // Catat ke Riwayat Pertandingan Terakhir
        $historyPath = $this->getHistoryFilePath();
        $history = file_exists($historyPath) ? json_decode(file_get_contents($historyPath), true) : [];
        if (!is_array($history)) $history = [];

        array_unshift($history, [
            'id' => 'match_' . uniqid(),
            'sport' => $sport,
            'mode' => $mode,
            'player_name' => $playerName,
            'player_score' => $playerScore,
            'opponent_score' => $opponentScore,
            'result' => $result,
            'pvp_stick_awarded' => $pvpStickAwarded,
            'rewards' => [
                'gold' => $rewardGold,
                'exp' => $rewardExp,
                'diamonds' => $rewardDiamonds,
                'pvp_sticks' => $pvpStickAwarded ? 1 : 0,
            ],
            'timestamp' => date('Y-m-d H:i:s'),
        ]);

        // Simpan 50 riwayat terakhir
        $history = array_slice($history, 0, 50);
        @file_put_contents($historyPath, json_encode($history, JSON_PRETTY_PRINT));

        // Hitung Win Rate
        $totalMatches = max(1, $pStats['matches_total'] ?? 0);
        $pStats['win_rate'] = ($pStats['matches_total'] > 0)
            ? round(($pStats['wins'] / $totalMatches) * 100)
            : 0;

        $msg = $pvpStickAwarded
            ? '🔥 SELAMAT! Kamu menang di Mode PvP dan mendapatkan +1 STIK MENANG KHUSUS PVP (Streak: ' . $pStats['pvp_streak'] . 'x)!'
            : 'Hasil pertandingan berhasil dicatat ke leaderboard!';

        return response()->json([
            'status' => 'success',
            'message' => $msg,
            'pvp_stick_awarded' => $pvpStickAwarded,
            'rewards' => [
                'gold' => $rewardGold,
                'exp' => $rewardExp,
                'diamonds' => $rewardDiamonds,
                'pvp_sticks' => $pvpStickAwarded ? 1 : 0,
                'current_pvp_streak' => $pStats['pvp_streak'] ?? 0,
                'total_pvp_sticks' => $pStats['pvp_sticks'] ?? 0,
            ],
            'user' => $userPayload,
            'stats' => $pStats,
        ]);
    }

    /**
     * GET /api/sports/leaderboard
     * Mengambil 10 pemain terbaik real-time berdasarkan kemenangan, gol, poin, dan Stik Menang PvP
     */
    public function getLeaderboard(Request $request)
    {
        $sport = $request->query('sport', 'soccer'); // 'soccer' | 'basketball' | 'pvp' | 'all'
        $playerName = trim($request->query('player_name') ?: $request->header('X-User-Name', ''));
        $allStats = $this->loadStatsData();

        $list = array_values($allStats);

        // Urutkan atlet berdasarkan metrik kategori olahraga yang dipilih
        usort($list, function ($a, $b) use ($sport) {
            if ($sport === 'pvp') {
                // Khusus Mode PvP: Urutkan berdasarkan STIK MENANG PVP & Kemenangan PvP
                $stickA = $a['pvp_sticks'] ?? 0;
                $stickB = $b['pvp_sticks'] ?? 0;
                if ($stickB !== $stickA) return $stickB <=> $stickA;

                $strkA = $a['pvp_streak'] ?? 0;
                $strkB = $b['pvp_streak'] ?? 0;
                if ($strkB !== $strkA) return $strkB <=> $strkA;

                $pvpWinsA = $a['pvp_wins'] ?? 0;
                $pvpWinsB = $b['pvp_wins'] ?? 0;
                return $pvpWinsB <=> $pvpWinsA;
            } elseif ($sport === 'soccer') {
                $winsA = $a['wins'] ?? 0;
                $winsB = $b['wins'] ?? 0;
                if ($winsB !== $winsA) return $winsB <=> $winsA;

                $goalsA = $a['soccer_goals'] ?? 0;
                $goalsB = $b['soccer_goals'] ?? 0;
                if ($goalsB !== $goalsA) return $goalsB <=> $goalsA;

                $stickA = $a['pvp_sticks'] ?? 0;
                $stickB = $b['pvp_sticks'] ?? 0;
                if ($stickB !== $stickA) return $stickB <=> $stickA;
            } elseif ($sport === 'basketball') {
                $winsA = $a['wins'] ?? 0;
                $winsB = $b['wins'] ?? 0;
                if ($winsB !== $winsA) return $winsB <=> $winsA;

                $ptsA = $a['basketball_points'] ?? 0;
                $ptsB = $b['basketball_points'] ?? 0;
                if ($ptsB !== $ptsA) return $ptsB <=> $ptsA;

                $stickA = $a['pvp_sticks'] ?? 0;
                $stickB = $b['pvp_sticks'] ?? 0;
                if ($stickB !== $stickA) return $stickB <=> $stickA;
            } else {
                $winsA = $a['wins'] ?? 0;
                $winsB = $b['wins'] ?? 0;
                if ($winsB !== $winsA) return $winsB <=> $winsA;
            }

            // Tiebreaker: Win Rate tertinggi
            $totA = max(1, $a['matches_total'] ?? 1);
            $totB = max(1, $b['matches_total'] ?? 1);
            $wrA = (($a['wins'] ?? 0) / $totA);
            $wrB = (($b['wins'] ?? 0) / $totB);
            return $wrB <=> $wrA;
        });

        // Hitung peringkat (rank) dan tandai pemain aktif
        $currentPlayerSummary = null;
        $playerKey = strtolower($playerName);

        foreach ($list as $idx => &$item) {
            $item['rank'] = $idx + 1;
            $totalMatches = max(1, $item['matches_total'] ?? 1);
            $item['win_rate'] = ($item['matches_total'] ?? 0) > 0
                ? round((($item['wins'] ?? 0) / $totalMatches) * 100)
                : 0;

            $isCurrent = $playerName && (strtolower($item['name']) === $playerKey);
            $item['is_current_player'] = $isCurrent;

            $totalPvp = max(1, $item['pvp_matches'] ?? 1);
            $item['pvp_win_rate'] = ($item['pvp_matches'] ?? 0) > 0
                ? round((($item['pvp_wins'] ?? 0) / $totalPvp) * 100)
                : 0;

            if ($isCurrent) {
                $currentPlayerSummary = $item;
            }
        }

        $top10 = array_slice($list, 0, 10);

        return response()->json([
            'status' => 'success',
            'sport' => $sport,
            'leaderboard' => $top10,
            'current_player' => $currentPlayerSummary,
            'total_athletes' => count($list),
        ]);
    }

    /**
     * GET /api/sports/stats/{playerName}
     * Mengambil statistik karir olahraga pemain dan peringkat global riil termasuk Stik Menang PvP
     */
    public function getPlayerStats($playerName)
    {
        $allStats = $this->loadStatsData();
        $playerKey = strtolower(trim($playerName));

        $stats = $allStats[$playerKey] ?? [
            'name' => $playerName,
            'matches_total' => 0,
            'wins' => 0,
            'losses' => 0,
            'draws' => 0,
            'soccer_goals' => 0,
            'basketball_points' => 0,
            'current_streak' => 0,
            'highest_streak' => 0,
            'pvp_wins' => 0,
            'pvp_matches' => 0,
            'pvp_streak' => 0,
            'pvp_highest_streak' => 0,
            'pvp_sticks' => 0,
            'last_played' => null,
        ];

        $totalMatches = max(1, $stats['matches_total'] ?? 0);
        $stats['win_rate'] = ($stats['matches_total'] ?? 0) > 0 
            ? round(($stats['wins'] / $totalMatches) * 100) 
            : 0;

        $totalPvp = max(1, $stats['pvp_matches'] ?? 0);
        $stats['pvp_win_rate'] = ($stats['pvp_matches'] ?? 0) > 0
            ? round((($stats['pvp_wins'] ?? 0) / $totalPvp) * 100)
            : 0;

        // Hitung peringkat global riil
        $rank = 1;
        $playerWins = $stats['wins'] ?? 0;
        foreach ($allStats as $k => $other) {
            if ($k !== $playerKey) {
                $otherWins = $other['wins'] ?? 0;
                if ($otherWins > $playerWins) {
                    $rank++;
                }
            }
        }
        $stats['rank'] = $stats['matches_total'] > 0 ? $rank : '-';

        return response()->json([
            'status' => 'success',
            'stats' => $stats,
        ]);
    }

    /** Path penyimpanan file sesi aktif mini game */
    private function getSessionFilePath(): string
    {
        return storage_path('app/sports_sessions.json');
    }

    private function loadSessionsData(): array
    {
        $path = $this->getSessionFilePath();
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            if (is_array($data)) return $data;
        }
        return [];
    }

    private function saveSessionsData(array $data): void
    {
        $dir = storage_path('app');
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        @file_put_contents($this->getSessionFilePath(), json_encode($data, JSON_PRETTY_PRINT));
    }

    /**
     * POST /api/sports/session
     * Menyimpan sesi aktif mini game pemain agar saat refresh tidak kembali ke world
     */
    public function saveSession(Request $request)
    {
        $sport = $request->input('sport', 'soccer');
        $mode = $request->input('mode', 'ai');
        $playerName = trim($request->input('player_name') ?: $request->header('X-User-Name', 'Petualang'));
        $avatar = $request->input('avatar', null);
        $returnX = floatval($request->input('return_x', $sport === 'soccer' ? 3480 : 6060));
        $returnY = floatval($request->input('return_y', 6040));

        $sessions = $this->loadSessionsData();
        $key = strtolower($playerName);

        $now = time();
        // Bersihkan sesi lama yang sudah lebih dari 4 jam
        foreach ($sessions as $k => $s) {
            if (isset($s['updated_at']) && ($now - $s['updated_at'] > 14400)) {
                unset($sessions[$k]);
            }
        }

        $sessionData = [
            'player_name' => $playerName,
            'sport' => $sport,
            'mode' => $mode,
            'avatar' => $avatar,
            'return_x' => $returnX,
            'return_y' => $returnY,
            'updated_at' => $now,
        ];

        $sessions[$key] = $sessionData;
        $this->saveSessionsData($sessions);

        return response()->json([
            'status' => 'success',
            'message' => 'Sesi mini game berhasil disimpan.',
            'session' => $sessionData,
        ]);
    }

    /**
     * GET /api/sports/session
     * Mengambil sesi aktif mini game pemain jika ada
     */
    public function getSession(Request $request)
    {
        $playerName = trim($request->query('player_name') ?: $request->header('X-User-Name', ''));
        if (!$playerName) {
            return response()->json([
                'status' => 'empty',
                'session' => null,
            ]);
        }

        $sessions = $this->loadSessionsData();
        $key = strtolower($playerName);

        if (isset($sessions[$key])) {
            $sess = $sessions[$key];
            // Validasi kedaluwarsa 4 jam
            if (time() - ($sess['updated_at'] ?? 0) < 14400) {
                return response()->json([
                    'status' => 'success',
                    'session' => $sess,
                ]);
            }
        }

        return response()->json([
            'status' => 'empty',
            'session' => null,
        ]);
    }

    /**
     * DELETE /api/sports/session
     * Menghapus sesi mini game saat pemain keluar kembali ke World
     */
    public function clearSession(Request $request)
    {
        $playerName = trim($request->input('player_name') ?: $request->header('X-User-Name', ''));
        if (!$playerName) {
            $playerName = trim($request->query('player_name', ''));
        }

        if ($playerName) {
            $sessions = $this->loadSessionsData();
            $key = strtolower($playerName);
            if (isset($sessions[$key])) {
                unset($sessions[$key]);
                $this->saveSessionsData($sessions);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Sesi mini game berhasil ditutup.',
        ]);
    }

    /** Path penyimpanan antrean matchmaking */
    private function getMatchmakingFilePath(): string
    {
        return storage_path('app/sports_matchmaking.json');
    }

    private function loadMatchmakingData(): array
    {
        $path = $this->getMatchmakingFilePath();
        if (file_exists($path)) {
            $data = json_decode(@file_get_contents($path), true);
            if (is_array($data)) {
                return [
                    'queue' => $data['queue'] ?? [],
                    'matches' => $data['matches'] ?? [],
                ];
            }
        }
        return ['queue' => [], 'matches' => []];
    }

    private function saveMatchmakingData(array $data): void
    {
        $dir = storage_path('app');
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        @file_put_contents($this->getMatchmakingFilePath(), json_encode($data, JSON_PRETTY_PRINT));
    }

    /**
     * POST /api/sports/matchmaking/queue
     * Mendaftar ke antrean Matchmaking PvP lintas server / satu server
     */
    public function queueMatchmaking(Request $request)
    {
        $sport = $request->input('sport', 'soccer'); // 'soccer' | 'basketball'
        $playerName = trim($request->input('player_name') ?: $request->header('X-User-Name', 'Petualang'));
        $currentServer = trim($request->input('server', 'Server 1: Garuda'));
        $avatar = $request->input('avatar');

        $data = $this->loadMatchmakingData();
        $now = time();

        // 1. Bersihkan antrean yang kedaluwarsa (> 45 detik)
        $cleanQueue = [];
        foreach ($data['queue'] as $qKey => $qItem) {
            if ($now - ($qItem['queued_at'] ?? 0) <= 45) {
                $cleanQueue[$qKey] = $qItem;
            }
        }

        // 2. Bersihkan match lama (> 120 detik)
        $cleanMatches = [];
        foreach ($data['matches'] as $mId => $mItem) {
            if ($now - ($mItem['created_at'] ?? 0) <= 120) {
                $cleanMatches[$mId] = $mItem;
            }
        }

        $playerKey = strtolower($playerName);

        // Ambil statistik PvP pemain aktif
        $allStats = $this->loadStatsData();
        $myStats = $allStats[$playerKey] ?? [];

        $currentEntry = [
            'player_name' => $playerName,
            'sport' => $sport,
            'server' => $currentServer,
            'pvp_streak' => $myStats['pvp_streak'] ?? 0,
            'pvp_sticks' => $myStats['pvp_sticks'] ?? 0,
            'avatar' => $avatar,
            'queued_at' => $now,
        ];

        // 3. Cek apakah ada pemain lain yang cocok di antrean untuk olahraga yang sama
        $matchedOpponent = null;
        $matchedKey = null;

        foreach ($cleanQueue as $otherKey => $otherItem) {
            if ($otherKey !== $playerKey && ($otherItem['sport'] ?? '') === $sport) {
                $matchedOpponent = $otherItem;
                $matchedKey = $otherKey;
                break;
            }
        }

        if ($matchedOpponent) {
            // Pasangkan keduanya ke pertandingan baru!
            unset($cleanQueue[$matchedKey]);
            unset($cleanQueue[$playerKey]);

            $matchId = 'match_' . uniqid();
            $newMatch = [
                'match_id' => $matchId,
                'sport' => $sport,
                'created_at' => $now,
                'p1' => $currentEntry,
                'p2' => $matchedOpponent,
            ];

            $cleanMatches[$matchId] = $newMatch;
            $data['queue'] = $cleanQueue;
            $data['matches'] = $cleanMatches;
            $this->saveMatchmakingData($data);

            return response()->json([
                'status' => 'matched',
                'message' => 'Lawan ditemukan di antrean!',
                'match_id' => $matchId,
                'opponent' => [
                    'name' => $matchedOpponent['player_name'],
                    'server' => $matchedOpponent['server'],
                    'pvp_streak' => $matchedOpponent['pvp_streak'] ?? 0,
                    'pvp_sticks' => $matchedOpponent['pvp_sticks'] ?? 0,
                    'avatar' => $matchedOpponent['avatar'] ?? null,
                    'is_live_player' => true,
                ],
            ]);
        }

        // Belum ada pemain lain yang menunggu, daftarkan diri ke antrean
        $cleanQueue[$playerKey] = $currentEntry;
        $data['queue'] = $cleanQueue;
        $data['matches'] = $cleanMatches;
        $this->saveMatchmakingData($data);

        return response()->json([
            'status' => 'queued',
            'message' => 'Sedang mencari lawan sepadan di server...',
            'queued_at' => $now,
        ]);
    }

    /**
     * GET /api/sports/matchmaking/status
     * Memeriksa status antrean apakah sudah dipasangkan dengan pemain lain
     */
    public function getMatchmakingStatus(Request $request)
    {
        $playerName = trim($request->query('player_name') ?: $request->header('X-User-Name', ''));
        if (!$playerName) {
            return response()->json(['status' => 'idle']);
        }

        $playerKey = strtolower($playerName);
        $data = $this->loadMatchmakingData();

        // Cari apakah pemain ada di list pertandingan aktif
        foreach ($data['matches'] as $match) {
            $p1Name = strtolower($match['p1']['player_name'] ?? '');
            $p2Name = strtolower($match['p2']['player_name'] ?? '');

            if ($p1Name === $playerKey) {
                return response()->json([
                    'status' => 'matched',
                    'match_id' => $match['match_id'],
                    'opponent' => [
                        'name' => $match['p2']['player_name'],
                        'server' => $match['p2']['server'],
                        'pvp_streak' => $match['p2']['pvp_streak'] ?? 0,
                        'pvp_sticks' => $match['p2']['pvp_sticks'] ?? 0,
                        'avatar' => $match['p2']['avatar'] ?? null,
                        'is_live_player' => true,
                    ],
                ]);
            } elseif ($p2Name === $playerKey) {
                return response()->json([
                    'status' => 'matched',
                    'match_id' => $match['match_id'],
                    'opponent' => [
                        'name' => $match['p1']['player_name'],
                        'server' => $match['p1']['server'],
                        'pvp_streak' => $match['p1']['pvp_streak'] ?? 0,
                        'pvp_sticks' => $match['p1']['pvp_sticks'] ?? 0,
                        'avatar' => $match['p1']['avatar'] ?? null,
                        'is_live_player' => true,
                    ],
                ]);
            }
        }

        // Cek apakah masih dalam antrean
        if (isset($data['queue'][$playerKey])) {
            return response()->json([
                'status' => 'queued',
                'queued_at' => $data['queue'][$playerKey]['queued_at'],
            ]);
        }

        return response()->json(['status' => 'idle']);
    }

    /**
     * POST /api/sports/matchmaking/cancel
     * Membatalkan pencarian lawan PvP
     */
    public function cancelMatchmaking(Request $request)
    {
        $playerName = trim($request->input('player_name') ?: $request->header('X-User-Name', ''));
        if ($playerName) {
            $data = $this->loadMatchmakingData();
            $playerKey = strtolower($playerName);
            if (isset($data['queue'][$playerKey])) {
                unset($data['queue'][$playerKey]);
                $this->saveMatchmakingData($data);
            }
        }

        return response()->json([
            'status' => 'cancelled',
            'message' => 'Pencarian musuh PvP dibatalkan.',
        ]);
    }

    /**
     * POST /api/sports/matchmaking/find-rival
     * Mencari atlet rival dari server lain jika tidak ada pemain manusia live yang antre
     */
    public function findRivalAthlete(Request $request)
    {
        $playerName = trim($request->input('player_name') ?: $request->header('X-User-Name', ''));
        $sport = $request->input('sport', 'soccer');
        $playerKey = strtolower($playerName);

        $allStats = $this->loadStatsData();

        // Kumpulkan daftar atlet yang bukan pemain aktif
        $rivalCandidates = [];
        $serverList = [
            'Server 1: Garuda',
            'Server 2: Nusantara',
            'Server 3: Merdeka',
            'Server 4: Cakrawala',
        ];

        foreach ($allStats as $k => $stats) {
            if ($k !== $playerKey) {
                $rivalCandidates[] = $stats;
            }
        }

        if (empty($rivalCandidates)) {
            $rivalCandidates[] = [
                'name' => 'KsatriaBintang',
                'pvp_streak' => 2,
                'pvp_sticks' => 4,
                'wins' => 9,
                'matches_total' => 12,
            ];
        }

        // Acak lawan
        $selectedRival = $rivalCandidates[array_rand($rivalCandidates)];
        $randomServer = $serverList[array_rand($serverList)];

        // Hapus pemain dari antrean jika ada
        $data = $this->loadMatchmakingData();
        if ($playerKey && isset($data['queue'][$playerKey])) {
            unset($data['queue'][$playerKey]);
            $this->saveMatchmakingData($data);
        }

        return response()->json([
            'status' => 'matched',
            'message' => 'Lawan petualang ditemukan!',
            'opponent' => [
                'name' => $selectedRival['name'],
                'server' => $randomServer,
                'pvp_streak' => $selectedRival['pvp_streak'] ?? 1,
                'pvp_sticks' => $selectedRival['pvp_sticks'] ?? 2,
                'wins' => $selectedRival['wins'] ?? 5,
                'win_rate' => $selectedRival['win_rate'] ?? 75,
                'avatar' => null,
                'is_cross_server' => true,
            ],
        ]);
    }
}
