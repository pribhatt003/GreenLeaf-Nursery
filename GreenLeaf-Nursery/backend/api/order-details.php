<?php

require_once "../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);

    exit;
}

$order_id = intval($_GET["order_id"] ?? 0);

if ($order_id <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Order ID missing"
    ]);

    exit;
}


// =========================
// GET ORDER INFORMATION
// =========================

$orderSql = "
    SELECT
        id,
        customer_name,
        email,
        phone,
        address,
        total_amount,
        order_status,
        created_at
    FROM orders
    WHERE id = ?
";

$orderStmt = $conn->prepare($orderSql);

if (!$orderStmt) {

    echo json_encode([
        "success" => false,
        "message" => "Order query failed"
    ]);

    exit;
}

$orderStmt->bind_param("i", $order_id);

$orderStmt->execute();

$orderResult = $orderStmt->get_result();

if ($orderResult->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Order not found"
    ]);

    $orderStmt->close();

    exit;
}

$order = $orderResult->fetch_assoc();

$orderStmt->close();


// =========================
// GET ORDER ITEMS
// =========================

$itemSql = "
    SELECT
        id,
        order_id,
        product_id,
        product_name,
        price,
        quantity,
        subtotal
    FROM order_items
    WHERE order_id = ?
    ORDER BY id ASC
";

$itemStmt = $conn->prepare($itemSql);

if (!$itemStmt) {

    echo json_encode([
        "success" => false,
        "message" => "Order items query failed"
    ]);

    exit;
}

$itemStmt->bind_param("i", $order_id);

$itemStmt->execute();

$result = $itemStmt->get_result();

$items = [];

while ($row = $result->fetch_assoc()) {

    $items[] = $row;

}

$itemStmt->close();


// =========================
// FINAL RESPONSE
// =========================

echo json_encode([
    "success" => true,
    "order" => $order,
    "items" => $items
]);

?>