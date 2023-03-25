<?php

declare(strict_types=1);

use App\Services\Router;

Router::page('/users', 'users');
Router::page('/articles', 'articles');
Router::page('/arts', 'arts');

Router::enable();