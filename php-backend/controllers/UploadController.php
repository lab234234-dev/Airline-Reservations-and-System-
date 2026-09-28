<?php
require_once dirname(__DIR__) . '/utils/Response.php';

class UploadController {
    private $uploadDir;

    public function __construct() {
        $this->uploadDir = dirname(__DIR__) . '/uploads/avatars/';
        if (!is_dir($this->uploadDir)) {
            @mkdir($this->uploadDir, 0755, true);
        }
    }

    public function uploadAvatar($input) {
        // 1. Check if multipart file was sent
        $file = $_FILES['avatar'] ?? $_FILES['file'] ?? $_FILES['image'] ?? null;
        if ($file && isset($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
            $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

            if (!in_array($ext, $allowedExts)) {
                Response::error('Invalid image type. Allowed: JPG, PNG, WEBP, GIF', 400);
            }

            if ($file['size'] > 5 * 1024 * 1024) {
                Response::error('Image size must be less than 5MB', 400);
            }

            $fileName = 'avatar_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $targetPath = $this->uploadDir . $fileName;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $url = '/api/uploads/' . $fileName;
                Response::json([
                    'success' => true,
                    'url' => $url,
                    'filename' => $fileName
                ], 201);
            } else {
                Response::error('Failed to save uploaded image file', 500);
            }
        }

        // 2. Check if Base64 data was sent in JSON body
        $base64 = $input['image'] ?? $input['avatar'] ?? $input['data'] ?? null;
        if ($base64 && preg_match('#^data:image/(\w+);base64,#i', $base64, $matches)) {
            $type = strtolower($matches[1]);
            if (!in_array($type, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                $type = 'jpg';
            }
            $data = substr($base64, strpos($base64, ',') + 1);
            $data = base64_decode($data);
            if ($data === false) {
                Response::error('Invalid Base64 image data', 400);
            }

            $fileName = 'avatar_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . ($type === 'jpeg' ? 'jpg' : $type);
            $targetPath = $this->uploadDir . $fileName;

            if (file_put_contents($targetPath, $data) !== false) {
                $url = '/api/uploads/' . $fileName;
                Response::json([
                    'success' => true,
                    'url' => $url,
                    'filename' => $fileName
                ], 201);
            } else {
                Response::error('Failed to save Base64 image file', 500);
            }
        }

        Response::error('No image file or Base64 data provided in request', 400);
    }

    public function serveFile($filename) {
        $filename = basename($filename); // Prevent directory traversal
        $filePath = $this->uploadDir . $filename;

        if (!file_exists($filePath)) {
            Response::error('File not found', 404);
        }

        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif'
        ];

        $contentType = $mimes[$ext] ?? 'application/octet-stream';
        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=86400');
        readfile($filePath);
        exit;
    }
}
