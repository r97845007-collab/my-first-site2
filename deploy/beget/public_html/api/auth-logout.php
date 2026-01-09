<?php
require_once __DIR__ . '/_util.php';

require_method('POST');

clear_session_cookie();

json_response(['ok' => true], 200);
