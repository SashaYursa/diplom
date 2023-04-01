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
        if (isset($res['error'])) {
            return $res;
        }
        return $res;
    }

    public function getCountImages($id)
    {
        $res = $this->db->getCountElementsWithParam('images_for_portfolio', 'portfolio_id', $id);
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

    private function deleteImage($from, $name)
    {
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

    public function deletePortfolioItem($id)
    {
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
}