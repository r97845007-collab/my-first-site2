<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');

clear_session_cookie();

sendJson(200, ['ok' => true]);
