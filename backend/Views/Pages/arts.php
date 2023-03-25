<?php

declare(strict_types=1);

use App\Account\User;
use App\Art\Art;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if ($method === 'POST') {
    $art = new Art();
    $result = [];

    if ($headers['status'] === 'create-portfolio') {
        $user = new User();
        $findUser = $user->getUser('user_token', $_POST['userToken']);
        if (isset($findUser['error'])) {
            echo json_encode($findUser);
        }
        $name = $_POST['name'];
        $description = $_POST['description'];
        $logo = $_FILES['logo'];
        $result = $art->addPortfolioItem($findUser['id'], $name, $description, $logo);
    }
    if ($headers['status'] === 'add-image-for-portfolio') {
        $id = $_POST['id'];
        $image = $_FILES['image'];
        $result = $art->addPortfolioImage($id, $image);
    }

    echo json_encode($result);
}
if ($method === 'GET') {
    $art = new Art();
    $res = [];
    if ($headers['status'] === 'get-image') {
        if (isset($_GET['item'])) {
            $res = $art->getArtByOffset($_GET['item']);
            header('Content-type: image/' . $res['extention']);
        }
        if (isset($_GET['id'])) {
            $item = $art->getArtByID($_GET['id']);
            if (isset($item['error'])) {
                echo json_encode($item);
            }
            $res = $art->getImage($item['portfolio_logo']);
            if (!$res['status']) {
                echo json_encode($res);
            }
            header('Content-type: image/' . $res['extention']);
        }
        readfile($res['path']);
    }
    if ($headers['status'] === 'get-info') {
        header("Content-type: json/application");
        if (isset($_GET['item'])) {
            $res = $art->getArtByOffset($_GET['item']);
        }
        if (isset($_GET['id'])) {
            $res = $art->getArtByID($_GET['id']);
            $res['countImages'] = $art->getCountImages($_GET['id']);
        }
        echo json_encode($res);
    }
    if ($headers['status'] === 'get-image-for-portfolio') {
        if (isset($_GET['id'])) {
            $item = $art->getImagesForPortfolio($_GET['id'], $_GET['offset'], 1);
            if (isset($item['error'])) {
                echo json_encode($item);
            }
            $res = $art->getImage($item[0]['image_name'], 'portfolio/images');
            if (!$res['status']) {
                echo json_encode($res);
            }
            header('Content-type: image/' . $res['extention']);
        }
        readfile($res['path']);
    }
    if ($headers['status'] === 'get-count-pages') {
        if (isset($_GET['itemsInPage'])) {
            $items = $art->getPages();
            $pages = ceil($items['count'] / $_GET['itemsInPage']);
            echo json_encode(['pages' => $pages, 'items' => $items['count']]);;
        } else {
            echo json_encode(['error' => 'Кількість записів на сторінці не задано']);
        }
    }
}
