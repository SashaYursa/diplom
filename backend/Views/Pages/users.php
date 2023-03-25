<?php

declare(strict_types=1);

use App\Account\User;

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = new User();
    if (isset($data['action'])) {
        if ($data['action'] === 'create') {
            $createdUser = $user->createUser($data['name'], $data['password'], $data['email']);
            if ($createdUser['status']) {
                $checkedUser = $user->authUser($data['name'], $data['password']);
                echo json_encode($checkedUser);
            } else {
                echo json_encode($createdUser);
            }
        }
        if ($data['action'] === 'auth') {
            $checkedUser = $user->authUser($data['name'], $data['password']);
            echo json_encode($checkedUser);
        }
    }
}
if ($method === 'GET') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = new User();
    if (isset($_GET['token'])) {
        $selectedUser = $user->getUser('user_token', $_GET['token']);
        echo json_encode($selectedUser);
    }
}