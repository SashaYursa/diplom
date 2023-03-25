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
            return $logo;
        }
        $res['path'] = $logo['path'];
        $res['extention'] = $logo['extention'];
        return $res;
    }

    public function getImagesForPortfolio($id, $offset, $limit)
    {
        $res = $this->db->getImageForPortfolio('images_for_portfolio', $id, $offset, $limit);
        if (isset($res['error'])) {
            return $res;
        }
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
        $fileName = time() . $file['name'];
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

    public function editArt($name, $password, $email)
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

    public function deleteArt($id)
    {
        return $this->db->deleteFromTable($this->tableName, $id);
    }
}