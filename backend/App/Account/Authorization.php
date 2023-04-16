<?php

declare(strict_types=1);

namespace App\Account;

use App\Database\DB;

class Authorization
{
    private $userName;
    private $userPassword;
    private $db;

    public function __construct($userName, $userPassword)
    {
        $this->userName = $userName;
        $this->userPassword = $userPassword;
        $this->db = new DB();
    }

    private function checkUserName()
    {
        if (!$this->db->checkItemInTable('users', 'login', $this->userName)) {
            return false;
        }
        return true;
    }

    public function checkUserPassword($correctPassword)
    {
        if (password_verify($this->userPassword, $correctPassword)) {
            return true;
        } else {
            return false;
        }
    }

    private function createToken($name)
    {
        return hash('sha256', time() . $name);
    }

    public function auditUser()
    {
        if (!$this->checkUserName()) {
            return ['error' => "Ім'я введено невірно"];
        }
        $user = $this->db->getFromTable('users', 'login', $this->userName);
        if (!$this->checkUserPassword($user['password'])) {
            return ['error' => "Пароль введено невірно"];
        }
        $token = $this->createToken($user['login']);
        $this->db->updateItemInTable('users', 'user_token', $token, $user['id']);
        $user['user_token'] = $token;
        return $user;
    }
}