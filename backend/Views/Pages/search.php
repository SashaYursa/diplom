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

    if (isset($_GET['value'])) {
        $searchValue = $_GET['value'];
        $userResponse = $user->search($searchValue);
        $artResponse = $art->search($searchValue);
        if (empty($userResponse) and empty($artResponse)) {
            $res = ['result' => false, 'message' => 'Нічого не знайдено'];
        } else {
            $res = ['result' => true, 'users' => $userResponse, 'works' => $artResponse];
        }
        echo json_encode($res);
    }
}