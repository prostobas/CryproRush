<?php
header('Content-Type: application/json');

// Получаем данные из POST запроса
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['records'])) {
    // Сохраняем данные в файл
    $success = file_put_contents(
        'leaderboard.json', 
        json_encode(['records' => $data['records']], JSON_PRETTY_PRINT)
    );
    
    if ($success) {
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Ошибка при сохранении']);
    }
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
}
?> 