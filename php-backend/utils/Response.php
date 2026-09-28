<?php
// Response helper utility
class Response {
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error($message, $statusCode = 400, $errors = null) {
        $payload = ['message' => $message];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        self::json($payload, $statusCode);
    }

    public static function success($message, $data = [], $statusCode = 200) {
        $payload = array_merge(['message' => $message], $data);
        self::json($payload, $statusCode);
    }
}
