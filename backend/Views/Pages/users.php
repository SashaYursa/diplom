<?php

declare(strict_types=1);

use App\Account\User;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
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
    if (isset($headers['status'])) {
        if ($headers['status'] === 'update-user') {
            $items = [];
            $errors = [];
            $res = [];
            foreach ($_POST as $key => $val) {
                $items[$key] = $val;
            }
            $userID = $items['userID'];

            if (isset($items['email'])) {
                if ($user->validateValue('email', $items['email'])) {
                    $errors['email error'] = "Така пошта вже занята";
                }
            }
            if (isset($items['oldPassword']) and isset($items['newPassword']) and isset($items['login'])) {
                $ableToChangePassword = $user->validateChangePassword(
                    $items['oldPassword'],
                    $items['oldLogin'],
                    $userID
                );
                if (!$ableToChangePassword['status']) {
                    $errors['password error'] = $ableToChangePassword['message'];
                }
            }
            if (isset($items['name'])) {
                if ($user->validateValue('login', $items['name'])) {
                    $errors['login error'] = "Таке ім'я вже занято";
                }
            }
            if (empty($errors)) {
                if (isset($items['email'])) {
                    $res['email'] = $user->updateUser($userID, 'email', $items['email']);
                }
                if (isset($items['oldPassword']) and isset($items['newPassword']) and isset($items['login'])) {
                    $res['password'] = $user->insertNewPassword($items['newPassword'], $userID);
                }
                if (isset($items['name'])) {
                    $res['name'] = $user->updateUser($userID, 'login', $items['name']);
                }
                if (isset($_FILES['image'])) {
                    $newImage = $_FILES['image'];
                    $res['image'] = $user->saveUserImage($newImage, $userID);
                }
                echo json_encode(['status' => true, 'success' => $res]);
            } else {
                echo json_encode(['status' => false, 'errors' => $errors]);
            }
//

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
    if (isset($_GET['imageName'])) {
        $res = $user->getImage($_GET['imageName']);
        if ($res['status']) {
            header('Content-type: image/' . $res['extention']);
            readfile($res['path']);
        }
    }
}