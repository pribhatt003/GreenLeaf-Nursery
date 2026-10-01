<?php

require_once "../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid data"
    ]);
    exit;
}

$customer_name = trim($data["customer_name"] ?? "");
$email = trim($data["email"] ?? "");
$phone = trim($data["phone"] ?? "");
$address = trim($data["address"] ?? "");
$total_amount = floatval($data["total_amount"] ?? 0);
$items = $data["items"] ?? [];

if (
    $customer_name === "" ||
    $email === "" ||
    $phone === "" ||
    $address === "" ||
    $total_amount <= 0 ||
    empty($items)
) {
    echo json_encode([
        "success" => false,
        "message" => "Required information is missing"
    ]);
    exit;
}

$conn->begin_transaction();

try {

    // Save order
    $orderSql = "
        INSERT INTO orders
        (customer_name, email, phone, address, total_amount)
        VALUES (?, ?, ?, ?, ?)
    ";

    $orderStmt = $conn->prepare($orderSql);

    if (!$orderStmt) {
        throw new Exception("Order prepare failed");
    }

    $orderStmt->bind_param(
        "ssssd",
        $customer_name,
        $email,
        $phone,
        $address,
        $total_amount
    );

    if (!$orderStmt->execute()) {
        throw new Exception("Order insert failed");
    }

    $order_id = $conn->insert_id;

    $orderStmt->close();


    // Save order items
    $itemSql = "
        INSERT INTO order_items
        (order_id, product_id, product_name, price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
    ";

    $itemStmt = $conn->prepare($itemSql);

    if (!$itemStmt) {
        throw new Exception("Order item prepare failed");
    }

    foreach ($items as $item) {

        $product_id = intval($item["product_id"] ?? 0);
        $product_name = $item["product_name"] ?? "";
        $price = floatval($item["price"] ?? 0);
        $quantity = intval($item["quantity"] ?? 0);

        $subtotal = $price * $quantity;

        if (
            $product_id <= 0 ||
            $product_name === "" ||
            $price <= 0 ||
            $quantity <= 0
        ) {
            throw new Exception("Invalid product information");
        }

        $itemStmt->bind_param(
            "iisdid",
            $order_id,
            $product_id,
            $product_name,
            $price,
            $quantity,
            $subtotal
        );

        if (!$itemStmt->execute()) {
            throw new Exception("Order item insert failed");
        }
    }

    $itemStmt->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Order placed successfully",
        "order_id" => $order_id
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

?>