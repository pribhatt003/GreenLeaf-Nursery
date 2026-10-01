<?php

require_once "../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);

    exit;
}

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!$data || !isset($data["order_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Order ID missing"
    ]);

    exit;
}

$order_id = intval($data["order_id"]);

if ($order_id <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid order ID"
    ]);

    exit;
}

$conn->begin_transaction();

try {

    // Delete order items first
    $itemsSql =
        "DELETE FROM order_items WHERE order_id = ?";

    $itemsStmt =
        $conn->prepare($itemsSql);

    $itemsStmt->bind_param(
        "i",
        $order_id
    );

    $itemsStmt->execute();

    $itemsStmt->close();


    // Delete order
    $orderSql =
        "DELETE FROM orders WHERE id = ?";

    $orderStmt =
        $conn->prepare($orderSql);

    $orderStmt->bind_param(
        "i",
        $order_id
    );

    $orderStmt->execute();


    if ($orderStmt->affected_rows === 0) {

        throw new Exception(
            "Order not found"
        );
    }

    $orderStmt->close();

    $conn->commit();


    echo json_encode([
        "success" => true,
        "message" => "Order deleted successfully"
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

?>
