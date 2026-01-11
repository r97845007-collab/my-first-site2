<?php
require __DIR__ . '/_bootstrap_path.php';
require APP_PRIVATE_PATH . '/lib/bootstrap.php';

auth_logout();
header('Location: /login.php');
