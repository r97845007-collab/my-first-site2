<?php
require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');
requireAdmin();

sendError(400, 'User token storage not enabled in this build');
