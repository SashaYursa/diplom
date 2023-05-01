<?php

declare(strict_types=1);

namespace App\Articles;

use App\Database\DB;

class Articles
{
    private $db;
    private $tableName = 'articles';

    public function __construct()
    {
        $this->db = new DB();
    }

    public function getArticle($id)
    {
        $res['response'] = $this->db->getFromTable($this->tableName, 'id', $id);
        if (empty ($res['response'])) {
            return ['response' => false];
        }
        file_exists('articles/images/' . $res['response']['logo'])
            ? $res['response']['logo'] = 'articles/images/' . $res['response']['logo']
            : $res['response']['logo'] = 'empty';
        return $res['response'];
    }

    public function getPacketArticle($limit, $offset)
    {
//        $user = new User();
//        $res['response'] = $this->db->getAllWithLimit($this->tableName, $limit, $offset);
//        if (empty ($res['response'])) {
//            return ['response' => false];
//        }

        $res['response'] = $this->db->getArticlesWithLimit($limit, $offset);
        if (empty ($res['response'])) {
            return ['response' => false];
        }
        foreach ($res['response'] as $key => $item) {
            file_exists('UserImages/' . $res['response'][$key]['user_image'])
                ? $res['response'][$key]['user_image'] = 'UserImages/' . $res['response'][$key]['user_image']
                : $res['response'][$key]['user_image'] = 'empty';
            file_exists('articles/images/' . $res['response'][$key]['logo'])
                ? $res['response'][$key]['logo'] = 'articles/images/' . $res['response'][$key]['logo']
                : $res['response'][$key]['logo'] = 'empty';
        }
        return $res;
    }

    public function getUserArticles($userID, $limit, $offset, $order, $orderType)
    {
        return $this->db->getPackArticlesForUser($userID, $limit, $offset, $order, $orderType);
    }

    public function addArticle($header, $desc, $body, $images)
    {
        $logo = 'empty';
        $imagesName = [];
        if (!empty($images)) {
            foreach ($images as $val) {
                $name = $this->saveImage($val, 'articles/images');
                if (isset($name['error'])) {
                    return $name['error'];
                }
                $imagesName[] = $name;
            }
            $logo = array_shift($imagesName);
        }
        $res['articles'] = $this->db->insertArticle($header, $desc, $body, $logo, '66');
        if (!empty($imagesName)) {
            foreach ($imagesName as $image) {
                $this->db->insertArticleImages($image, $res['articles']['id']);
            }
        }
        return ['logo' => $logo, 'res' => $res];
    }

    private function saveImage($file, $dir)
    {
        $tmpName = $file['tmp_name'];
        if (!is_dir($dir)) {
            mkdir($dir);
        }
        if (move_uploaded_file($tmpName, $dir . '/' . $file['name'])) {
            return $file['name'];
        } else {
            return ['error' => 'Файл не збережено'];
        }
    }

    public function deleteArticle($id, $userID)
    {
        $element = $this->db->getFromTable($this->tableName, 'id', $id);
        if (intval($element['author_id']) === intval($userID)) {
            $this->db->deleteFromTable($this->tableName, 'id', $id);
            return ['status' => true, 'message' => 'Пост видалено'];
        } else {
            return ['status' => false, 'message' => 'Ви не маєте права видаляти даний пост'];
        }
    }

    public function updateArticle($id, $articleName, $desc, $body, $images, $oldImages)
    {
        $res = [];
        $article = $this->db->getFromTable($this->tableName, 'id', $id);
        $logoIsRemoved = true;
        foreach ($oldImages as $key => $oldImage) {
            if ($oldImage === $article['logo']) {
                unset($oldImages[$key]);
                $logoIsRemoved = false;
            }
        }

        if (!$this->checkLogo($oldImages, $article['logo'])['status'] and $logoIsRemoved) {
            $logoIsUpdated = false;
            if ($article['logo'] !== 'empty') {
                if (!$this->deleteOldLogo($id, $article['logo'])) {
                    $res['oldLogoStatus'] = 'Старий логотип не видалено';
                } else {
                    $res['oldLogoStatus'] = 'Старий логотип видалено';
                }
            }
            if (!empty($images)) {
                $newLogo = array_shift($images);
                $this->saveImage($newLogo, 'articles/images');
                $this->setNewLogo($id, $newLogo['name']);
                $logoIsUpdated = true;
            }
            if (!$logoIsUpdated and !empty($oldImages)) {
                $newLogo = array_shift($oldImages);
                $this->db->deleteFromTable('images_for_articles', 'image_name', $newLogo);
                $this->setNewLogo($id, $newLogo);
                $logoIsUpdated = true;
            }
            if ($logoIsUpdated) {
                $res['newLogoSet'] = 'Новий логотип встановлено';
            } else {
                $res['newLogoSet'] = 'Новий логотип не встановлено';
            }
        }
        $deletedImages = 0;
        $allImagesFromDB = $this->db->getAllImagesForArticle($id);
        foreach ($allImagesFromDB as $imageFromDB) {
            $delete = true;
            foreach ($oldImages as $oldImage) {
                if ($imageFromDB['image_name'] === $oldImage) {
                    $delete = false;
                }
            }
            if ($delete) {
                $deletedImages++;
                $this->deleteImage($imageFromDB['image_name']);
                $this->db->deleteFromTable('images_for_articles', 'id', $imageFromDB['id']);
            }
        }
        if ($deletedImages > 0) {
            $res['deletdImages'] = 'Було видалено ' . $deletedImages . ' зображень';
        }

        if (!empty($images)) {
            $imagesName = [];
            foreach ($images as $image) {
                $name = $this->saveImage($image, 'articles/images');
                if (isset($name['error'])) {
                    return $name['error'];
                }
                $imagesName[] = $name;
            }

            if (!empty($imagesName)) {
                foreach ($imagesName as $imageName) {
                    $this->db->insertArticleImages($imageName, $id);
                }
                $res['addedNewImages'] = 'Додано ' . count($imagesName) . ' зображень';
            } else {
                $res['addedNewImages'] = 'Нових зображень не додано';
            }
        }
        $this->db->updateArticle($articleName, $desc, $body, $id);
        $res['status'] = true;
        return $res;
    }

    private function checkLogo($images, $oldLogo)
    {
        foreach ($images as $key => $image) {
            if ($oldLogo === $image) {
                return ['status' => true, 'key' => $key];
            }
        }
        return ['status' => false];
    }

    private function setNewLogo($articleID, $imageName)
    {
        $this->db->updateItemInTable($this->tableName, 'logo', $imageName, $articleID);
    }

    private function deleteOldLogo($articleID, $oldLogoName)
    {
        $this->db->updateItemInTable($this->tableName, 'logo', 'empty', $articleID);
        if ($this->deleteImage($oldLogoName)) {
            return true;
        }
        return false;
    }

    private function deleteImage($name): bool
    {
        $path = 'articles/images/' . $name;
        if (file_exists($path)) {
            unlink($path);
            return true;
        }
        return false;
    }
}