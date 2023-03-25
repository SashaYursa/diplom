<?php

declare(strict_types=1);

namespace App\Database;

use PDO;

class DB
{
    private $link;
    private $config = [
        'host' => 'localhost',
        'db_name' => 'artist_blog',
        'user_name' => 'root',
        'password' => '',
        'charset' => 'utf8'
    ];
    private $date;

    public function __construct()
    {
        $this->connect();
        date_default_timezone_set('Europe/Kyiv');
        $this->date = date('Y-m-d H:i:s', time());
    }

    private function connect()
    {
        $dsn = 'mysql:host=' . $this->config['host'] . ';dbname=' . $this->config['db_name'] . ';charset=' . $this->config['charset'];
        try {
            $this->link = new PDO($dsn, $this->config['user_name'], $this->config['password']);
        } catch (\Exception $e) {
            return $e;
        }
        return $this;
    }

    private function execute($sql)
    {
        $sth = $this->link->prepare($sql);
        return $sth->execute();
    }

    private function query($sql)
    {
        $sth = $this->link->prepare($sql);
        $sth->execute();
        $result = $sth->fetchAll(PDO::FETCH_ASSOC);
        if ($result === false) {
            return [];
        }
        return $result;
    }

    //Методи які використовується для всіх таблиць
    //Отримання останнього доданого елемента таблиці
    public function getLastInsert($table): int
    {
        $sql = "SELECT MAX(`id`) as 'id' FROM `${table}` ";
        $res = $this->query($sql);
        return $res[0]['id'];
    }

    //Отримання всіх записів з таблиціз із заданим лімітом
    public function getAllWithLimit($table, $offset = 0, $limit = 10): array
    {
        $sql = "SELECT * FROM `${table}` LIMIT ${limit} OFFSET ${offset}";
        try {
            $result = $this->query($sql);
        } catch (Exception) {
            return ['error' => "Таблиці не існує"];
        }
        return $result;
    }

    //Видалення запису з таблиці
    public function deleteFromTable($table, $id): array
    {
        $sql = "DELETE FROM `${table}` WHERE `${table}`.`id` = ${id}";
        try {
            $this->execute($sql);
            return ['ok' => "Запис в таблиці видалено"];
        } catch (Exception) {
            return ['error' => "Запис не видалено"];
        }
    }

    public function getCountElementsWithParam($table, $param, $value)
    {
        $sql = "SELECT COUNT(id) as 'count' FROM `${table}` WHERE `${param}` = '${value}'";
        $result = $this->query($sql);
        return $result;
    }

    public function getCountElements($table)
    {
        $sql = "SELECT COUNT(id) as 'count' FROM `${table}` WHERE 1";
        $result = $this->query($sql);
        return $result[0];
    }

    //Отримання всіх записів з таблиці з умовою
    public function getFromTable($table, $param, $value): array
    {
        $sql = "SELECT * FROM `${table}` WHERE `${table}`.`${param}` = '${value}'";
        $result = $this->query($sql);
        if (!empty($result)) {
            return $result[0];
        } else {
            return ['error' => 'Записів не знайдено'];
        }
    }

    //Перевірка чи існує запис в таблиці
    public function checkItemInTable($table, $param, $value): bool
    {
        $sql = "SELECT '$param' FROM `${table}` WHERE `${table}`.`${param}` = '${value}'";
        $result = $this->query($sql);
        if (!empty($result)) {
            return true;
        } else {
            return false;
        }
    }

    //Оновлення запису в таблиці
    public function updateItemInTable($table, $param, $value, $id): bool
    {
        $sql = "UPDATE `${table}` SET `${param}` = '${value}' WHERE `${table}`.`id` = ${id}";
        $result = $this->execute($sql);
        return $result;
    }

    //Методи які використовуються для користувачів
    //Додавання користувача в таблицю

    public function insertUser($name, $password, $email): bool
    {
        $sql = "INSERT INTO `users` (`id`, `login`, `password`, `email`, `created_at`, `user_token`) 
                VALUES (NULL, '${name}', '${password}', '${email}', '{$this->date}', '1')";
        $res = $this->execute($sql);
        return $res;
    }


    //Методи які використовуються для Портфоліо
    //Додавання роботи в таблицю portfolio
    public function insertItemInPortfolio($authorID, $name, $description, $image): bool
    {
        $sql = "INSERT INTO `portfolio` (`id`, `author_id`, `name`, `description`,`portfolio_logo`, `created_at`) 
                VALUES (NULL, '${authorID}', '${name}', '${description}', '{$image}', '{$this->date}')";
        $res = $this->execute($sql);
        return $res;
    }

    // Додавання фотографій роботи в таблицю images_for_portfolio
    public function insertImageForPortfolio($authorID, $imageName): bool
    {
        $sql = "INSERT INTO `images_for_portfolio` (`id`, `portfolio_id`, `image_name`) 
                VALUES (NULL, '${authorID}', '${imageName}');";
        $res = $this->execute($sql);
        return $res;
    }

    //Отримання 1 елементу портфолі який відсортований по даті по спаданню
    public function getPortfolioElement($offset)
    {
        $sql = "SELECT * FROM `portfolio` ORDER BY `created_at` DESC LIMIT 1 OFFSET ${offset}";
        $result = $this->query($sql);
        if (!empty($result)) {
            return $result[0];
        } else {
            return ['status' => false, 'message' => 'Результат не знайдено'];
        }
    }

    public function getImageForPortfolio($table, $id, $offset = 0, $limit = 1): array
    {
        $sql = "SELECT * FROM `${table}` WHERE `portfolio_id` = '${id}' LIMIT ${limit} OFFSET ${offset}";
        try {
            $result = $this->query($sql);
        } catch (Exception) {
            return ['error' => "Таблиці не існує"];
        }
        return $result;
    }
}
