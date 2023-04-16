<?php

declare(strict_types=1);

namespace App\Account;

use App\Database\DB;

class User
{
    private $db;
    private $tableName = 'users';

    public function __construct()
    {
        $this->db = new DB();
    }

    public function getUser(string $param, string $val): array
    {
        return $this->db->getFromTable($this->tableName, $param, $val);
    }

    public function authUser(string $userName, string $password): array
    {
        $auth = new Authorization($userName, $password);
        return $auth->auditUser();
    }

    public function validateChangePassword($oldPassword, $login, $userID)
    {
        $auth = new Authorization($login, $oldPassword);
        $user = $this->getUser('id', $userID);
        if (!$auth->checkUserPassword($user['password'])) {
            return ['status' => false, 'message' => 'Старий пароль введено невірно'];
        }
        return ['status' => true];
    }

    public function insertNewPassword($password, $userID)
    {
        $reg = new Registration('1', $password, '1');
        $password = $reg->hashUserPassword();
        $this->db->updateItemInTable($this->tableName, 'password', $password, $userID);
        return ['status' => true, 'message' => 'Пароль змінено'];
    }

    public function createUser(string $name, string $password, string $email): array
    {
        $reg = new Registration($name, $password, $email);
        $user = $reg->createUser();
        return $user;
    }

    public function validateValue($param, $name)
    {
        return $this->db->checkItemInTable($this->tableName, $param, $name);
    }

    public function saveUserImage($userImage, $userID)
    {
        $prevImage = $this->db->getFromTable($this->tableName, 'id', $userID);
        if ($prevImage['user_image'] !== 'empty') {
            if (file_exists('UserImages/' . $prevImage['user_image'])) {
                unlink('UserImages/' . $prevImage['user_image']);
            }
        }
        $imageSave = $this->saveImage($userImage, 'UserImages');
        if (isset($imageSave['error'])) {
            return ['status' => $imageSave['error']];
        }
        $this->db->updateItemInTable($this->tableName, 'user_image', $imageSave, $userID);
        return ['status' => true, 'message' => 'Фото змінено'];
    }

    private function saveImage($file, $dir)
    {
        $salt = rand(0, 100);
        $fileName = time() . $salt . $file['name'];
        $tmpName = $file['tmp_name'];
        if (!is_dir($dir)) {
            mkdir($dir);
        }
        if (move_uploaded_file($tmpName, $dir . '/' . $fileName)) {
            return $fileName;
        } else {
            return ['error' => 'Файл не збережено'];
        }
    }

    public function getImage($name, $dir = 'UserImages/'): array
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

    public function getPages()
    {
        $res = $this->db->getCountElements($this->tableName);
        return $res;
    }

    public function getPacketUsers(int $limit, int $offset): array
    {
        return $this->db->getAllWithLimit($this->tableName, $limit, $offset);
    }

    public function deleteUser(int $id): array
    {
        return $this->db->deleteFromTable($this->tableName, 'id', $id);
    }

    public function updateUser($id, string $param, string $val): array
    {
        if ($this->db->updateItemInTable($this->tableName, $param, $val, $id)) {
            return ['status' => true, 'message' => $param . ' змінено'];
        }
        return ['status' => false, 'message' => $param . ' не змінено'];
    }

}