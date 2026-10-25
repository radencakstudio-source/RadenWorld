@echo off
:: Batch script to switch Windows System PATH from XAMPP PHP to Laragon PHP 8.3
title Switch PHP to Laragon 8.3
echo ========================================================
echo   Memperbarui System PATH ke Laragon PHP 8.3.30
echo ========================================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] PERINGATAN: File ini memerlukan hak Administrator.
    echo     Silakan klik kanan file ini lalu pilih "Run as administrator".
    echo.
    pause
    exit /b 1
)

powershell -NoProfile -Command ^
    "$path = [Environment]::GetEnvironmentVariable('Path', 'Machine'); " ^
    "if ($path -match 'D:\\xampp\\php') { " ^
    "    $newPath = $path.Replace('D:\xampp\php', 'D:\laragon\laragon\bin\php\php-8.3.30-Win32-vs16-x64'); " ^
    "    [Environment]::SetEnvironmentVariable('Path', $newPath, 'Machine'); " ^
    "    Write-Host '[V] Sukses mengganti D:\xampp\php menjadi PHP 8.3 di System PATH!' -ForegroundColor Green; " ^
    "} elseif (-not ($path -match 'php-8.3.30')) { " ^
    "    $newPath = 'D:\laragon\laragon\bin\php\php-8.3.30-Win32-vs16-x64;' + $path; " ^
    "    [Environment]::SetEnvironmentVariable('Path', $newPath, 'Machine'); " ^
    "    Write-Host '[V] Sukses menambahkan PHP 8.3 ke System PATH!' -ForegroundColor Green; " ^
    "} else { " ^
    "    Write-Host '[i] System PATH sudah menggunakan PHP 8.3!' -ForegroundColor Yellow; " ^
    "}"

echo.
echo ========================================================
echo Selesai! Silakan buka ulang terminal, lalu cek dengan:
echo php -v
echo ========================================================
echo.
pause
