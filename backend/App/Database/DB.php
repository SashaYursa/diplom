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
        'charset' => 'utf8',
        'port' => '3306',
    ];
//    private $config = [
//        'host' => 'localhost',
//        'db_name' => 'sashayursa',
//        'user_name' => 'diplom123',
//        'password' => 'Yursa16',
//        'charset' => 'utf8',
//        'port' => '3306',
//    ];

//    private $config = [
//        'host' => 'mow.h.filess.io',
//        'db_name' => 'photoalbum_gasturnfew',
//        'user_name' => 'photoalbum_gasturnfew',
//        'password' => '49869f2ef4c77d948e8922555f6e6078737fdae1',
//        'charset' => 'utf8',
//        'port' => '3307'
//    ];
    private $date;

    public function __construct()
    {
        $this->connect();
        date_default_timezone_set('Europe/Kyiv');
        $this->date = date('y-m-d h:i:s', time());
    }

    private function connect()
    {
        $dsn = 'mysql:host=' . $this->config['host'] . ';dbname=' . $this->config['db_name'] . ';charset=' . $this->config['charset'] . ';port=' . $this->config['port'];
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
            return false;
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
    public function getAllWithLimit($table, $limit = 10, $offset = 0): array
    {
        $sql = "SELECT * FROM `${table}` LIMIT ${limit} OFFSET ${offset}";
        $result = $this->query($sql);
        return $result;
    }

    //Видалення запису з таблиці
    public function deleteFromTable($table, $param, $val): array
    {
        $sql = "DELETE FROM `${table}` WHERE `${table}`.`${param}` = '${val}'";

        //       try {
        $this->execute($sql);
        return ['ok' => "Запис в таблиці видалено"];
//        } catch (Exception) {
//            return ['error' => "Запис не видалено"];
//        }
    }

    public function getCountElementsWithParam($table, $element, $param, $value)
    {
        $sql = "SELECT COUNT($element) as 'count' FROM `${table}` WHERE `${param}` = '${value}'";
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

    public function getFieldFromTable($table, $field, $param, $value): array
    {
        $sql = "SELECT ${field} FROM `${table}` WHERE `${table}`.`${param}` = '${value}' ORDER BY ${field} DESC";
        $result = $this->query($sql);
        if (!empty($result)) {
            return $result;
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
        // try {
        $result = $this->query($sql);
//        } catch (Exception) {
//            return ['error' => "Таблиці не існує"];
//        }
        return $result;
    }

    //Методи для користувача при роботі з портфоліо в меню користувача
    //Отримання роботи користувача
    public function getUserPortfolioItems($table, $user, $limit, $offset)
    {
        $sql = "SELECT * FROM `$table` WHERE `author_id` = ${user} ORDER BY `id` DESC LIMIT ${limit} OFFSET ${offset}";
        $result = $this->query($sql);
        return $result;
    }

    //Отримання роботи по id користувача для перевірки того що це саме його робота
    public function checkUserHasPortfolioItem($userID, $itemID)
    {
        $sql = "SELECT * FROM `portfolio` WHERE `author_id` = ${userID} AND `id` = ${itemID}";
        $res = $this->query($sql);
        return $res;
    }

    public function getAllImagesForPortfolio($portfolioID)
    {
        $sql = "SELECT * FROM `images_for_portfolio` WHERE `portfolio_id` = ${portfolioID}";
        return $this->query($sql);
    }

    public function setNewPortfolioLogo($logoName, $newName)
    {
        $sql = "UPDATE `portfolio` SET `portfolio_logo` = '${newName}' WHERE `portfolio`.`portfolio_logo` = '${logoName}'";
        //      try {
        $this->execute($sql);
        return ['ok' => "Запис в таблиці видалено"];
//        } catch (Exception) {
//            return ['error' => "Запис не видалено"];
//        }
    }

    public function movePortfolioLogoToPortflioItem($newName, $oldName)
    {
        $sql = "UPDATE `images_for_portfolio` SET `image_name` = '${newName}' WHERE `images_for_portfolio`.`image_name` = '${oldName}'";
        //     try {
        $this->execute($sql);
        return ['ok' => "Запис в таблиці видалено"];
//        } catch (Exception) {
//            return ['error' => "Запис не видалено"];
//        }
    }

    public function searchInTable($table, $param, $search)
    {
        $sql = "SELECT * FROM `${table}` WHERE `${table}`.`${param}` LIKE '${search}%'";
        //     try {
        return $this->query($sql);
        //   } catch (\Exception $e) {
        //          return ['error' => $e];
        //  }
    }

    public function checkLike($portfolioID, $userID)
    {
        $sql = "SELECT * FROM `likes_for_portfolio` WHERE `likes_for_portfolio`.`user_id` = $userID and `likes_for_portfolio`.`portfolio_id` = $portfolioID";
        //    try {
        return $this->query($sql);
        //    } catch (\Exception $e) {
        //       return ['error' => $e];
        //    }
    }

    public function insertLike($portfolioID, $userID)
    {
        $sql = "INSERT INTO `likes_for_portfolio` (`id`, `portfolio_id`, `user_id`) VALUES (NULL, '${portfolioID}', '${userID}')";
        //  try {
        $this->execute($sql);
        return ['ok' => true];
        // } catch (Exception) {
        //     return ['ok' => false];
        // }
    }

    public function removeLike($userID)
    {
        $sql = "DELETE FROM likes_for_portfolio WHERE `likes_for_portfolio`.`user_id` = ${userID}";
        //   try {
        $this->execute($sql);
        return ['ok' => true];
        //  } catch (\Exception $e) {
        //      return ['ok' => false, 'error' => $e];
        // }
    }

    public function getMostPopularWork()
    {
        $sql = "
        SELECT `likes_for_portfolio`.`portfolio_id`, COUNT(*) as count FROM `likes_for_portfolio` 
        GROUP BY `likes_for_portfolio`.`portfolio_id` ORDER BY count DESC LIMIT 1";
        //    try {
        return $this->query($sql);
        //   } catch (\Exception $e) {
        //       return ['error' => $e];
        //   }
    }

    public function getPopularsWork()
    {
        $sql = "
        SELECT `likes_for_portfolio`.`portfolio_id`, COUNT(*) as count FROM `likes_for_portfolio` 
        GROUP BY `likes_for_portfolio`.`portfolio_id` ORDER BY count DESC LIMIT 8 OFFSET 1";
        //  try {
        return $this->query($sql);
        // } catch (\Exception $e) {
        //     return ['error' => $e];
        //}
    }

    public function getArticlesWithLimit($limit, $offset)
    {
        $sql = "SELECT articles.*,users.login, users.user_image, COUNT(DISTINCT likes_for_articles.id) as likes_count, 
               COUNT(DISTINCT coments_for_articles.id) as coments_count 
              FROM  users, articles
              LEFT JOIN likes_for_articles ON articles.id = likes_for_articles.article_id 
              LEFT JOIN coments_for_articles ON articles.id = coments_for_articles.article_id 
              WHERE users.id = articles.author_id
              GROUP BY articles.id
              LIMIT ${limit} OFFSET ${offset}";
        return $this->query($sql);
    }

    public function insertArticleImages($image, $articleID)
    {
        $sql = "INSERT INTO `images_for_articles` (`id`, `article_id`, `image_name`) VALUES (NULL, '${articleID}', '${image}')";
        $this->execute($sql);
    }

    public function insertArticle($name, $desc, $text, $logo, $authorID)
    {
        $sql = "INSERT INTO `articles` (`id`, `name`, `description`, `text`, `logo`, `created_at`, `hide`, `author_id`) 
                VALUES (NULL, '${name}','${desc}', '${text}', '${logo}', CURRENT_TIMESTAMP, '2', '${authorID}')";
        $this->execute($sql);
        $id = $this->getLastInsert('articles');
        return ['ok' => true, 'id' => $id];
    }

    public function updateArticle($name, $description, $text, $articleID)
    {
        $sql = "UPDATE `articles` SET `name` = '${name}', `description` = '${description}', `text` = '${text}' WHERE `articles`.`id` = ${articleID}";
        $this->execute($sql);
    }

    public function getAllImagesForArticle($articleID)
    {
        $sql = "SELECT * FROM `images_for_articles` WHERE `article_id` = ${articleID}";
        return $this->query($sql);
    }

    public function getPackArticlesForUser($id, $limit = 10, $offset = 0, $order = 'created_at', $orderType = 'DESC')
    {
        $sql = "SELECT `articles`.`id`,`articles`.`name`,`articles`.`description`,`articles`.`created_at`,
                `articles`.`logo`, `articles`.`hide`, COUNT(DISTINCT likes_for_articles.id) as likes_count
                FROM `articles`
                LEFT JOIN likes_for_articles ON articles.id = likes_for_articles.article_id 
                WHERE `articles`.`author_id` = '${id}'
                GROUP BY `articles`.`id` 
                ORDER BY `articles`.`${order}` ${orderType} 
                LIMIT ${limit} OFFSET ${offset} 
                ";
        return $this->query($sql);
    }
}
