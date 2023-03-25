<?php

declare(strict_types=1);

namespace App\Account;

use App\Database\DB;
use App\Account\Authorization;

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

    public function createUser(string $name, string $password, string $email): array
    {
        $reg = new Registration($name, $password, $email);
        $user = $reg->createUser();
        return $user;
    }

    public function getPacketUsers(int $limit, int $offset): array
    {
        return $this->db->getAllWithLimit($this->tableName, $limit, $offset);
    }

    public function deleteUser(int $id): array
    {
        return $this->db->deleteFromTable($this->tableName, $id);
    }

    public function updateUser(int $id, string $param, string $val): bool
    {
        return $this->db->updateItemInTable($this->tableName, $param, $val, $id);
    }

}