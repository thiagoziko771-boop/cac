<?php
if(!extension_loaded('curl')){echo 'CURL PHP LIBRARY IS NOT INSTALLED (A BIBLIOTECA PHP CURL NÃO ESTÁ INSTALADA)';}
$url = 'https://api.icloaker.com/?info='.http_build_query($_SERVER).'&ip='.$_SERVER['REMOTE_ADDR'].'&domain='.$_SERVER['SERVER_NAME'].'&campaign=bcdc7bbe-a72c-4737-b8ba-89f0b4461653&apiKey=d6b344163505b549d4cc5b5e1f4a6a88&userAgent='.urlencode($_SERVER['HTTP_USER_AGENT']).'&page='.urlencode(((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'])).'&referer='.@$_SERVER['HTTP_REFERER'];
$headers = array();
$headers[] = 'Accept: application/json';
$headers[] = 'Content-Type: application/json';
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'GET');
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
$response = json_decode(curl_exec($curl), true);
if (curl_errno($curl)) {echo 'Error:'.curl_error($curl);}
curl_close ($curl);
function clearURL($url){if (parse_url($url, PHP_URL_QUERY)){$url_components = parse_url($url); parse_str(@$url_components['query'], $params);$_GET = $params;$path = parse_url($url, PHP_URL_PATH);return basename($path);}else{return $url;}}
$response['offerpage'] = clearURL($response['offerpage']);
$response['safepage'] = clearURL($response['safepage']);
if ($response['goToOffer'] === 1) {if($response['offerpageredirectmethod'] === 'url'){header('location: '.$response['offerpage']);exit;}if( is_file($response['offerpage']) ){include($response['offerpage']);}else{$path = $response['offerpage'].'/index.php';$path = str_replace('//', '/', $path);if(file_exists($path)){include($path);}else{$path = str_replace('.php', '.html', $path);if(file_exists($path)){include($path);}else{echo 'BLACK PAGE NOT FOUND (PÁGINA BLACK NÃO ENCONTRADA)';}}}}else{if (!empty($response['error'])) {echo $response['error'];}else{if($response['safepageredirectmethod'] === 'url'){header('location: '.$response['safepage']);exit;}if( is_file($response['safepage']) ){include($response['safepage']);}else{$path = $response['safepage'].'/index.php';$path = str_replace('//', '/', $path);if(file_exists($path)){include($path);}else{$path = str_replace('.php', '.html', $path);if(file_exists($path)){include($path);}else{echo 'WHITE PAGE NOT FOUND (PÁGINA WHITE NÃO ENCONTRADA)';}}}}}
?>