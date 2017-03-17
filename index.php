<?php

function authorized() {
    $user = $_SERVER['PHP_AUTH_USER'];
    $pass = md5($_SERVER['PHP_AUTH_PW']);

    require_once 'auth.php';

    return !(!isset($users[$user]) || $users[$user] != $pass);
}

if (!isset($_SERVER['PHP_AUTH_USER'])) {
    header('WWW-Authenticate: Basic realm="My Realm"');
    header('HTTP/1.0 401 Unauthorized');
    exit;

} else if (!authorized()) {
    header('HTTP/1.0 401 Unauthorized');
    exit;
}

echo file_get_contents('index.html');
