<?php

declare(strict_types=1);

use App\Services\Router;

Router::page('/users', 'users');
Router::page('/articles', 'articles');
Router::page('/arts', 'arts');
Router::page('/admin/users', 'Admin/users');
Router::page('/admin/works', 'Admin/works');

Router::enable();