<?php

declare(strict_types=1);

use App\Account\User;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if ($method === 'GET') {
    $user = new User();
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($headers['limit']) and isset($headers['offset']) and isset($_GET['userAccess'])) {
        $limit = intval($headers['limit']);
        $offset = intval($headers['offset']);
        $userAdminStatus = $_GET['userAccess'];
        $res = $user->getPacketUsers($limit, $offset);
        if ($userAdminStatus == 1) {
            $i = 0;
            foreach ($res as $val) {
                if ($val['is_admin'] == 2) {
                    unset($res[$i]);
                }
                $i++;
            }
        }
        echo json_encode(['users' => $res]);
    }
    if (isset($headers['status'])) {
        if ($headers['status'] === 'get-count-pages') {
            $items = $user->getPages();
            $pages = ceil($items['count'] / $_GET['itemsInPage']);
            echo json_encode(['pages' => $pages, 'items' => $items['count']]);;
        }

        if ($headers['status'] === 'get-user') {
            if (isset($_GET['id'])) {
                $res = $user->getUser('id', $_GET['id']);
                echo json_encode($res);
            }
        }
    }
}
if ($method === 'POST') {
    $user = new User();
    if ($headers['status'] === 'update-image') {
        $newImage = $_FILES['image'];
        $res['image'] = $user->saveUserImage($newImage, $_POST['userID']);
        echo json_encode($res);
    }
}
if ($method === 'DELETE') {
    $id = intval($_GET['id']);

    $user = new User();
    $res = $user->deleteUser($id);
    echo json_encode(['status' => true, 'res' => $res]);
}
if ($method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userID = $data['userID'];
    $user = new User();
    $res = [];
    $errors = [];
    if ($headers['status'] === 'update-password') {
        $res = $user->insertNewPassword($data['password'], $data['userID']);
        echo json_encode($res);
    }
    if ($headers['status'] === 'update-user') {
        foreach ($data as $key => $val) {
            if ($key !== 'userID') {
                if ($key === 'login') {
                    if ($user->validateValue($key, $val)) {
                        $errors['login'] = "Таке ім'я вже є";
                    }
                }
                if ($key === 'email') {
                    if ($user->validateValue($key, $val)) {
                        $errors['email'] = "Таке Email вже є";
                    }
                }
                if (empty($errors)) {
                    $res[$key] = $user->updateUser($userID, $key, strval($val));
                } else {
                    echo json_encode(['error' => $errors]);
                    return;
                }
            }
        }
        echo json_encode(['success' => $res]);
    }
}
