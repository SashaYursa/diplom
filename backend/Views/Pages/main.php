<?php

declare(strict_types=1);

use App\Account\User;
use App\Art\Art;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if ($method === 'GET') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = new User();
    $art = new Art();

    if (isset($headers['status'])) {
        $res = [];
        if ($headers['status'] === 'get-most-popular') {
            $res = $art->getPopularWork();
        }
        echo json_encode($res);
    } else {
        echo json_encode(['headers' => $headers]);
    }
}