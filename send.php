<?php

require_once 'config.php';

$ch = curl_init('https://api.cloudflare.com/client/v4/' . $_GET['endpoint'] . '?per_page=20&page=' . $_GET['page']);

curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_GET['method']);
curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'X-Auth-Email:'. CLOUDFLARE_AUTH_EMAIL,
    'X-Auth-Key:'. CLOUDFLARE_AUTH_KEY
));

$result = curl_exec($ch);
curl_close($ch);

echo $result;
