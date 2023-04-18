<?php

declare(strict_types=1);

use App\Account\User;
use App\Art\Art;

$method = $_SERVER['REQUEST_METHOD'];
$art = new Art();
$headers = getallheaders();
if ($method === 'POST') {
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
    if ($headers['status'] === 'edit-portfolio-item') {
        $itemID = $_POST['itemID'];
        $userToken = $_POST['userToken'];
        $user = new User();
        $findUser = $user->getUser('user_token', $userToken);
        if (isset($findUser['error'])) {
            echo json_encode($findUser);
            die();
        }
        $userID = $findUser['id'];

        $portfolioItem = $art->checkUserCanEditArt($userID, $itemID);
        if (!$portfolioItem) {
            $result = ['error' => 'Редагувати дану роботу неможливо', 'portfolioItem' => $portfolioItem];
        } else {
            $portfolioItem = $portfolioItem[0];
            $images = [];
            $portfolioImages = $art->getAllImagesForPortfolio($itemID);
            foreach ($portfolioImages as $portfolioImage) {
                array_push($images, $portfolioImage['image_name']);
            }
            $result = [
                'portfolioName' => $portfolioItem['name'],
                'portfolioDesc' => $portfolioItem['description'],
                'portfolioLogo' => $portfolioItem['portfolio_logo'],
                'portfolioImages' => $images,
            ];
        }
    }
    if ($headers['status'] === 'update-portfolio-item') {
        $newName = $_POST['editedName'];
        $newDesc = $_POST['editedDesc'];
        $itemID = $_POST['itemID'];
        $art->editArt('name', $newName, $itemID);
        $art->editArt('description', $newDesc, $itemID);
        foreach ($_FILES as $image) {
            $art->addPortfolioImage($itemID, $image);
        }
        $result = ['res' => 'Оновлено'];
    }

    echo json_encode($result);
}
if ($method === 'GET') {
    $res = [];
    if ($headers['status'] === 'get-image') {
        if (isset($_GET['item'])) {
            $res = $art->getArtByOffset($_GET['item']);
            header('Content-type: image/' . $res['extention']);
            readfile($res['path']);
        }
        if (isset($_GET['id'])) {
            $item = $art->getArtByID($_GET['id']);
            if (isset($item['error'])) {
                echo json_encode($item);
                return;
            } else {
                $res = $art->getImage($item['portfolio_logo']);
                if (!$res['status']) {
                    echo json_encode($res);
                } else {
                    header('Content-type: image/' . $res['extention']);
                    readfile($res['path']);
                }
            }
        }
        if (isset($_GET['name'])) {
            $res = $art->getImage($_GET['name']);
            header('Content-type: image/' . $res['extention']);
            readfile($res['path']);
        }
    }
    if ($headers['status'] === 'get-info') {
        header("Content-type: json/application");
        if (isset($_GET['item'])) {
            $res = $art->getArtByID($_GET['item']);
        }
        if (isset($_GET['id'])) {
            $user = new User();
            $res = $art->getArtByID($_GET['id']);
            $res['countImages'] = $art->getCountImages($_GET['id']);
            $userData = $user->getUser('id', strval($res['author_id']));
            $res['user'] = [
                'user_image' => $userData['user_image'],
                'login' => $userData['login'],
                'email' => $userData['email']
            ];
        }
        echo json_encode($res);
    }
    if ($headers['status'] === 'get-image-for-portfolio') {
        if (isset($_GET['id'])) {
            $item = $art->getImagesForPortfolio($_GET['id'], $_GET['offset'], 1);
            if (isset($item['error'])) {
                header('status: file-not-found');
                echo json_encode($item);
            }
            $res = $art->getImage($item[0]['image_name'], 'portfolio/images');
            if (!$res['status']) {
                echo json_encode($res);
            }
            header('Content-type: image/' . $res['extention']);
            readfile($res['path']);
        }
    }
    if ($headers['status'] === 'get-count-pages') {
        if (isset($_GET['itemsInPage'])) {
            $items = $art->getVisiblePages();
            $countPages = ceil(count($items) / $_GET['itemsInPage']);
            $pages = [];
            for ($i = 1; $i <= $countPages; $i++) {
                $offset = ($i - 1) * $_GET['itemsInPage'];
                $page = [];
                for ($j = 0; $j < $_GET['itemsInPage']; $j++) {
                    if (isset($items[$j + $offset])) {
                        $page[$j + $offset] = $items[$j + $offset];
                    }
                }
                $pages[$i] = $page;
            }
            echo json_encode(['countPages' => $countPages, 'pages' => $pages]);;
        } else {
            echo json_encode(['error' => 'Кількість записів на сторінці не задано']);
        }
    }

    // Методи які використовуються для портофоліо на сторінці користувача
    if ($headers['status'] === 'get-user-portfolio') {
        if (isset($_GET['id']) && isset($_GET['limit']) && isset($_GET['offset'])) {
            $items = $art->getUserArts($_GET['id'], $_GET['limit'], $_GET['offset']);
            echo json_encode(['items' => $items]);
        } else {
            echo json_encode(['get' => $_GET]);
        }
    }
    if ($headers['status'] === 'get-images-for-edit') {
        if (isset($_GET['name']) && isset($_GET['type'])) {
            $res = $art->getImage($_GET['name'], 'portfolio/' . $_GET['type']);
            header('Content-type: image/' . $res['extention']);
            readfile($res['path']);
        }
    }
}

if ($method === 'DELETE') {
    if (isset($headers['status'])) {
        if ($headers['status'] === 'delete-image-in-edit') {
            $data = json_decode(file_get_contents('php://input'), true);
            $res = $art->deleteArt($data['imageName'], $data['removeFrom']);
            if (isset($res['fromDB']['ok']) && isset($res['fromImage']['ok'])) {
                $res = ['status' => true];
            } else {
                $res = ['staus' => false];
            }
            echo json_encode($res);
        }
    }
    if (isset($_GET['id'])) {
        $res = $art->deletePortfolioItem($_GET['id']);
        echo json_encode(['status' => 'ok', 'res' => $res]);
    }
}
if ($method === 'PATCH') {
    if (isset($headers['status'])) {
        if ($headers['status'] === 'update-logo') {
            $data = json_decode(file_get_contents('php://input'), true);
            $oldLogo = $data['oldLogoName'];
            $newLogo = $data['newLogoName'];
            $res = $art->setNewLogo($oldLogo, $newLogo);
            echo json_encode(['res' => $res]);
        }
        if ($headers['status'] === 'set-like') {
            if (isset($_GET['id']) and isset($_GET['uid'])) {
                $res = $art->setLike($_GET['id'], $_GET['uid']);
                echo json_encode($res);
            }
        }
    }
}
