<?php
// Simple & Robust JWT Implementation (No external Composer dependency needed)

class JWT {
    private static $secret = 'skyhigh_airline_secret_key_2026_super_secure';

    public static function encode($payload, $expirySeconds = 2592000) { // 30 days
        $header = ['typ' => 'JWT', 'alg' => 'HS256'];
        $issuedAt = time();
        $payload['iat'] = $issuedAt;
        $payload['exp'] = $issuedAt + $expirySeconds;

        $base64Header = self::base64UrlEncode(json_encode($header));
        $base64Payload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret, true);
        $base64Signature = self::base64UrlEncode($signature);

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    public static function decode($token) {
        if (empty($token)) return null;

        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        list($base64Header, $base64Payload, $base64Signature) = $parts;

        $expectedSig = self::base64UrlEncode(
            hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret, true)
        );

        if (!hash_equals($expectedSig, $base64Signature)) {
            return null; // Signature mismatch
        }

        $payload = json_decode(self::base64UrlDecode($base64Payload), true);
        if (!$payload) return null;

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Token expired
        }

        return $payload;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4 ? 4 - (strlen($data) % 4) : 0, '=', STR_PAD_RIGHT));
    }
}
