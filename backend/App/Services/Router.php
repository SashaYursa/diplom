<?php

declare(strict_types=1);

namespace App\Services;

class Router
{
    private static $list = [];

    public static function page($uri, $pageName)
    {
        self::$list[] = [
            "uri" => $uri,
            "page" => $pageName
        ];
    }

    public static function enable()
    {
        if (!isset($_GET['q'])) {
            die();
        }
        $query = $_GET['q'];
        foreach (self::$list as $route) {
            if ($route['uri'] === '/' . $query) {
                require_once 'Views/Pages/' . $route['page'] . '.php';
                die();
            }
        }
        self::pageNotFound();
    }

    private static function pageNotFound()
    {
        require_once "Views/Errors/404.php";
    }
}