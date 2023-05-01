<?php

declare(strict_types=1);

use App\Account\User;
use App\Art\Art;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if ($method === 'GET') {
    $portfolio = new Art();
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($headers['limit']) and isset($headers['offset']) and isset($_GET['userAccess'])) {
        $limit = intval($headers['limit']);
        $offset = intval($headers['offset']);
        $userAdminStatus = $_GET['userAccess'];
        $res = $portfolio->getAtrsWithLimitForAdmin($offset, $limit);
        echo json_encode(['works' => $res]);
    }
    if (isset($headers['status'])) {
        if ($headers['status'] === 'get-count-pages') {
            $items = $portfolio->getPages();
            $pages = ceil($items['count'] / $_GET['itemsInPage']);
            echo json_encode(['pages' => $pages, 'items' => $items['count']]);;
        }

        if ($headers['status'] === 'get-work') {
            if (isset($_GET['id'])) {
                $user = new User();
                $res = $portfolio->getArtForEdit($_GET['id'], $user);
                echo json_encode($res);
            }
        }
    }
}
if ($method === 'POST') {
    $art = new Art();
    if (isset($headers['status'])) {
        if ($headers['status'] === 'update-portfolio-item') {
            $itemID = $_POST['itemID'];
            if (isset($_POST['workName'])) {
                $art->editArt('name', $_POST['workName'], $itemID);
            }
            if (isset($_POST['workDesc'])) {
                $art->editArt('description', $_POST['workDesc'], $itemID);
            }
            foreach ($_FILES as $image) {
                $art->addPortfolioImage($itemID, $image);
            }
            $result = ['res' => true];
            echo json_encode($result);
        }
    }
}
if ($method === 'DELETE') {
    if (isset($headers['status'])) {
        $id = intval($_GET['id']);
        $work = new Art();
        if ($headers['status'] === 'delete-work') {
            // зробити видалення лише тоді коли видаляє адмін, перевіряти по id
            $res = $work->deletePortfolioItem($id);
            echo json_encode($res);
        }
        if ($headers['status'] === 'delete-image') {
            echo json_encode($work->deleteImageByID($_GET['id']));
        }
    }
}
if ($method === 'PATCH') {
    $art = new Art();
    if (isset($headers['status'])) {
        $data = json_decode(file_get_contents('php://input'), true);
        if ($headers['status'] === 'update-logo') {
            $oldLogo = $data['oldLogoName'];
            $newLogo = $data['newLogoName'];
            $res = $art->setNewLogoByID($oldLogo, $newLogo);
            echo json_encode($res);
        }
        if ($headers['status'] === 'update-status') {
            echo json_encode($art->updateStatus($data['workID'], $data['status']));
        }
    }
}
