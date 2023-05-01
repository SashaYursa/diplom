<?php

declare(strict_types=1);

namespace App\Art;

use App\Database\DB;

class Art
{
    private $db;
    private $tableName = 'portfolio';

    public function __construct()
    {
        $this->db = new DB();
    }

    public function getPages()
    {
        $res = $this->db->getCountElements($this->tableName);
        return $res;
    }

    public function getVisiblePages()
    {
        $res = $this->db->getFieldFromTable($this->tableName, 'id', 'hide', 0);
        return $res;
    }

    public function getArtByOffset($offset): array
    {
        $res = $this->db->getPortfolioElement($offset);
        if (isset($res['error'])) {
            return $res;
        }
        $logo = $this->getImage($res['portfolio_logo'], 'portfolio/logo');
        if (!$logo['status']) {
            return ['logo' => $logo, 'res' => $res];
        }
        $res['path'] = $logo['path'];
        $res['extention'] = $logo['extention'];
        return $res;
    }

    public function getImagesForPortfolio($id, $offset, $limit)
    {
        $res = $this->db->getImageForPortfolio('images_for_portfolio', $id, $offset, $limit);
        return $res;
    }

    public function getAllImagesForPortfolio($id)
    {
        $res = $this->db->getAllImagesForPortfolio($id);
        return $res;
    }

    public function getArtByID($id): array
    {
        $res = $this->db->getFromTable($this->tableName, 'id', $id);
        $likes = $this->db->getCountElementsWithParam('likes_for_portfolio', 'id', 'portfolio_id', $res['id']);
        $res['likes'] = $likes[0]['count'];
        if (isset($res['error'])) {
            return $res;
        }
        return $res;
    }

    public function getCountImages($id)
    {
        $res = $this->db->getCountElementsWithParam('images_for_portfolio', 'id', 'portfolio_id', $id);
        return $res[0]['count'];
    }

    public function getImage($name, $dir = 'portfolio/logo'): array
    {
        $filePath = $dir . '/' . $name;
        $extention = $this->getExtention($name);
        if (file_exists($filePath)) {
            return ['status' => true, 'path' => $filePath, 'extention' => $extention];
        }
        return ['status' => false, 'error' => 'Файл не знайдено'];
    }

    private function getExtention(string $fileName)
    {
        $splite = explode('.', $fileName);
        return end($splite);
    }

    public function addPortfolioImage($id, $image)
    {
        $imageSave = $this->saveImage($image, 'portfolio/images');
        if (isset($imageSave['fileName'])) {
            $result = $this->db->insertImageForPortfolio($id, $imageSave['fileName']);
            if ($result) {
                return [
                    'status' => true,
                    'message' => 'Запис в базу даних успішно додано'
                ];
            } else {
                return [
                    'status' => false,
                    'message' => 'Запис в базу даних не додано'
                ];
            }
        } else {
            return [
                'status' => false,
                'message' => $imageSave['error']
            ];
        }
    }

    public function setLike($portfolioID, $userID)
    {
        $res = [];
        if (empty($this->db->checkLike($portfolioID, $userID))) {
            $res = $this->db->insertLike($portfolioID, $userID);
        } else {
            $res = $this->db->removeLike($userID);
        }
        if ($res['ok']) {
            $likes = $this->db->getCountElementsWithParam('likes_for_portfolio', 'id', 'portfolio_id', $portfolioID);
            return ['likes' => $likes[0]['count']];
        }
    }

    public function addPortfolioItem(int $authorID, string $name, string $description, array $image)
    {
        $imageSave = $this->saveImage($image, 'portfolio/logo');
        if (isset($imageSave['fileName'])) {
            $result = $this->db->insertItemInPortfolio($authorID, $name, $description, $imageSave['fileName']);
            if ($result) {
                $insertID = $this->db->getLastInsert($this->tableName);
                return [
                    'status' => true,
                    'id' => $insertID,
                    'message' => 'Запис в базу даних успішно додано'
                ];
            } else {
                return [
                    'status' => false,
                    'message' => 'Запис в базу даних не додано'
                ];
            }
        } else {
            return [
                'status' => false,
                'message' => $imageSave['error']
            ];
        }
    }

    private function saveImage($file, $dir): array
    {
        $salt = rand(0, 100);
        $fileName = time() . $salt . $file['name'];
        $tmpName = $file['tmp_name'];
        if (!is_dir($dir)) {
            mkdir($dir);
        }
        if (move_uploaded_file($tmpName, $dir . '/' . $fileName)) {
            return ['fileName' => $fileName];
        } else {
            return ['error' => 'Файл не збережено'];
        }
    }

    public function getUserArts($user, $limit, $offset)
    {
        $res = $this->db->getUserPortfolioItems($this->tableName, $user, $limit, $offset);
        return $res;
    }

    public function checkUserCanEditArt($userID, $artID)
    {
        $res = $this->db->checkUserHasPortfolioItem($userID, $artID);
        if (empty($res)) {
            return false;
        }
        return $res;
    }

    public function editArt($param, $val, $id)
    {
        return $this->db->updateItemInTable($this->tableName, $param, $val, $id);
    }

    public function getPacketArt($offset = 0, $limit = 9)
    {
        $res = $this->db->getAllWithLimit($this->tableName, $limit, $offset);
        $logo = $this->getImage($res['portfolio_logo'], 'portfolio/logo');
        if (isset($logo['error'])) {
            return ['status' => false, 'error' => $logo['error']];
        }
        $res['logo'] = $logo['file'];
    }

    public function getArtForEdit($id, $user)
    {
        $res = $this->getArtByID($id);
        $createdBy = $user->getUser('id', strval($res['author_id']));
        $images = $this->getAllImagesForPortfolio($_GET['id']);
        $res['user'] = [
            'login' => $createdBy['login'],
            'is_admin' => $createdBy['is_admin'],
            'image' => $createdBy['user_image'],
            'email' => $createdBy['email'],
        ];
        $res['images'] = $images;
        return $res;
    }

    public function getAtrsWithLimitForAdmin($offset = 0, $limit = 15)
    {
        $works = $this->db->getAllWithLimit($this->tableName, $limit, $offset);
        for ($i = 0; $i < count($works); $i++) {
            $user = $this->db->getFromTable('users', 'id', $works[$i]['author_id']);
            $works[$i]['user'] = [
                'login' => $user['login'],
                'is_admin' => $user['is_admin'],
                'user_image' => $user['user_image']
            ];
        }
        return $works;
    }

    private
    function deleteImage(
        $from,
        $name
    ) {
        $path = 'portfolio' . '/' . $from . '/' . $name;
        if (!unlink($path)) {
            return ['error' => 'Файл не видалено'];
        }
        return ['ok' => 'Файл видалено'];
    }

    public function deleteArt($name, $location)
    {
        $res = [];
        if ($location === 'logo') {
            $res['fromDB'] = $this->db->updatePortfolioLogo($name, 'empty');
        }
        if ($location === 'images') {
            $res['fromDB'] = $this->db->deleteFromTable('images_for_portfolio', 'image_name', $name);
        }
        $res['fromImage'] = $this->deleteImage($location, $name);
        return $res;
    }

    public
    function deletePortfolioItem(
        $id,
        $userID
    ) {
        $item = $this->db->getFromTable($this->tableName, 'id', $id);
        if (intval($item['author_id']) !== intval($userID)) {
            return ['status' => false, 'message' => 'Немає доступу'];
        }
        $images = $this->db->getAllImagesForPortfolio($id);
        $logo = $this->db->getFromTable($this->tableName, 'id', $id);
        $res = $this->db->deleteFromTable($this->tableName, 'id', $id);
        foreach ($images as $image) {
            unlink('portfolio/images/' . $image['image_name']);
        }
        unlink('portfolio/logo/' . $logo['portfolio_logo']);
        return ['status' => true];
    }

    public function setNewLogo($oldLogo, $newLogo)
    {
        try {
            $rename1 = rename('portfolio/logo/' . $oldLogo, 'portfolio/images/' . $oldLogo);
            $rename2 = rename('portfolio/images/' . $newLogo, 'portfolio/logo/' . $newLogo);
            if ($rename1 && $rename2) {
            } else {
                throw new \Exception('Не переміщено файлии');
            }
        } catch (\Exception $e) {
            return [false => $e];
        }
        $res = $this->db->setNewPortfolioLogo($oldLogo, $newLogo);
        $res2 = $this->db->movePortfolioLogoToPortflioItem($oldLogo, $newLogo);
        if (isset($res['ok']) && isset($res2['ok'])) {
            return [true => 'Логотип успішно змінено'];
        } else {
            return [false => 'Логотип не змінено'];
        }
    }

    public function setNewLogoByID($oldLogoID, $newLogoID)
    {
        $oldLogo = $this->db->getFromTable($this->tableName, 'id', $oldLogoID)['portfolio_logo'];
        $newLogo = $this->db->getFromTable('images_for_portfolio', 'id', $newLogoID)['image_name'];
        try {
            $rename1 = rename('portfolio/logo/' . $oldLogo, 'portfolio/images/' . $oldLogo);
            $rename2 = rename('portfolio/images/' . $newLogo, 'portfolio/logo/' . $newLogo);
            if ($rename1 && $rename2) {
            } else {
                throw new \Exception('Не переміщено файлии');
            }
        } catch (\Exception $e) {
            return [false => $e];
        }
        $res = $this->db->setNewPortfolioLogo($oldLogo, $newLogo);
        $res2 = $this->db->movePortfolioLogoToPortflioItem($oldLogo, $newLogo);
        if (isset($res['ok']) && isset($res2['ok'])) {
            return ['ok' => true, 'message' => 'Логотип успішно змінено'];
        } else {
            return ['ok' => false, 'message' => 'Логотип не змінено'];
        }
    }

    public function deleteImageByID($id)
    {
        $image = $this->db->getFromTable('images_for_portfolio', 'id', $id);
        $res = $this->db->deleteFromTable('images_for_portfolio', 'id', $id);
        if (isset($res['ok'])) {
            return $this->deleteImage('images', $image['image_name']);
        }
        return $res;
    }

    public function updateStatus($id, $status)
    {
        $res = [];
        switch ($status) {
            case 'process':
            case 'hide':
                $this->db->updateItemInTable($this->tableName, 'hide', '0', $id);
                $res = ['status' => true, 'message' => 'Переведено в активний статус'];
                break;
            case 'visible':
                $this->db->updateItemInTable($this->tableName, 'hide', '1', $id);
                $res = ['status' => true, 'message' => 'Переведено в неактивний статус'];
                break;
            default:
                $res = ['status' => false];
        }
        return $res;
    }

    public function search($val)
    {
        $res = [];
        $response = $this->db->searchInTable($this->tableName, 'name', $val);
        foreach ($response as $key => $val) {
            if ($val['hide'] === 0) {
                $res[$key]['id'] = $val['id'];
                $res[$key]['name'] = $val['name'];
                $res[$key]['description'] = $val['description'];
                $res[$key]['portfolio_logo'] = $val['portfolio_logo'];
            }
        }
        return $res;
    }

    public function getPopularWork()
    {
        $mostPopularId = $this->db->getMostPopularWork();
        $res['mostPopular'] = $this->db->getFromTable($this->tableName, 'id', $mostPopularId[0]['portfolio_id']);
        $popularsIDs = $this->db->getPopularsWork();
        foreach ($popularsIDs as $key => $val) {
            $res['popularWorks'][$key] = $this->db->getFromTable($this->tableName, 'id', $val['portfolio_id']);
            $res['popularWorks'][$key]['likes'] = $val['count'];
        }
        return $res;
    }
}