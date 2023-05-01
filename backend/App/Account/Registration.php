<?php

declare(strict_types=1);

namespace App\Account;

use App\Database\DB;

class Registration
{
    private $userName;
    private $userPassword;
    private $userEmail;
    private $db;

    public function __construct($userName, $userPassword, $userEmail)
    {
        $this->userName = $userName;
        $this->userPassword = $userPassword;
        $this->userEmail = $userEmail;
        $this->db = new DB();
    }

    private function checkUserName()
    {
        if ($this->db->checkItemInTable('users', 'login', $this->userName)) {
            return false;
        } else {
            return true;
        }
    }

    public function hashUserPassword()
    {
        $options = [
            'cost' => 12,
        ];
        return password_hash($this->userPassword, PASSWORD_BCRYPT, $options);
    }

    private function checkUserEmail()
    {
        if ($this->db->checkItemInTable('users', 'email', $this->userEmail)) {
            return false;
        } else {
            return true;
        }
    }

    public function createUser()
    {
        if (!$this->checkUserName()) {
            return ['status' => false, 'error' => "Ім'я користувача занято"];
        }
        if (!$this->checkUserEmail()) {
            return ['status' => false, 'error' => "Пошта вже занята"];
        }
        $this->userPassword = $this->hashUserPassword();
        $res = $this->db->insertUser($this->userName, $this->userPassword, $this->userEmail);
        return ['status' => $res];
    }
}