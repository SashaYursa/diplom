<?php

declare(strict_types=1);
header("Content-type: json/application");
require_once(__DIR__ . '/vendor/autoload.php');
require_once(__DIR__ . '/Router/routes.php');

//echo php_ini_loaded_file();
//phpinfo();
//class Main
//{
//    const DIR = __DIR__;
//    private $params;
//    private $method;
//
//    public function __construct()
//    {
//        //$this->params = explode('/', $_GET['q']);
//        //$this->method = $_SERVER['REQUEST_METHOD'];
//        header("Content-type: json/application");
//        // $this->checkType($this->params, $this->method);
//        $this->createUser();
//    }
//
//    private function checkType($params, $method)
//    {
//        if ($params[0] === 'users') {
//            include_once __DIR__ . '\Account\User.php';
//            $user = new User();
//            if ($method === 'POST') {
//                $data = json_decode(file_get_contents('php://input'), true);
//                $create = $user->createUser($data['name'], $data['password'], $data['email']);
//
//                $user = ['status' => $create];
//                echo json_encode($user);
//            }
//        }
//    }
//
//    public function createUser()
//    {
//        include_once __DIR__ . '\Account\User.php';
//        $user = new User();
//        echo $user->createUser('sasha', 'password', 'sahsa@sa.as');
//    }
//
//    function tt($item)
//    {
//        echo '<pre>';
//        print_r($item);
//        echo '</pre>';
//    }
//}
//
//$main = new Main();
////$main->insert();
