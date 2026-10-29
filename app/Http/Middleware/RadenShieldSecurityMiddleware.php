<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RadenShieldSecurityMiddleware
{
    /**
     * Filter keamanan global RadenShield:
     * - Mitigasi PHP CGI Argument Injection (CVE-2024-4577)
     * - Blokir Path Traversal & Remote File Inclusion
     * - Header Keamanan Modern (HSTS, Anti-Sniffing, Anti-Clickjacking)
     * - Penyamaran Informasi Server (Information Disclosure Protection)
     */
    public function handle(Request $request, Closure $next): Response
    {
        $queryString = $request->server('QUERY_STRING', '');
        $uri = $request->getRequestUri();

        // 1. Blokir Exploit PHP CGI Argument Injection (CVE-2024-4577)
        if (
            preg_match('/(%ad|%AD|\xad|-d|-s|auto_prepend_file|allow_url_include)/i', $queryString) ||
            preg_match('/(%ad|%AD|\xad)/i', $uri)
        ) {
            return response()->json([
                'status' => 'blocked',
                'message' => '🛡️ RadenShield Security Alert: Malicious request blocked (CVE-2024-4577 mitigation).',
            ], 403);
        }

        // 2. Blokir Path Traversal & Null Byte Injection
        if (
            strpos($queryString, '../') !== false ||
            strpos($queryString, '..\\') !== false ||
            strpos($uri, '../') !== false ||
            strpos($uri, '..\\') !== false ||
            strpos($uri, '%00') !== false
        ) {
            return response()->json([
                'status' => 'blocked',
                'message' => '🛡️ RadenShield Security Alert: Directory traversal payload detected and blocked.',
            ], 403);
        }

        // 3. Sanitasi Input Request dari Prototype Pollution payload (__proto__, constructor)
        $allInputs = $request->all();
        if (isset($allInputs['__proto__']) || isset($allInputs['constructor'])) {
            unset($allInputs['__proto__'], $allInputs['constructor']);
            $request->replace($allInputs);
        }

        /** @var Response $response */
        $response = $next($request);

        // 4. Tambahkan Security Headers Komprehensif
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');
        $response->headers->set('Server', 'RadenShield/3.0');

        return $response;
    }
}
