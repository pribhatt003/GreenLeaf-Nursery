<?php

require_once "../config/database.php";

header("Content-Type: application/json");


// UPDATE ORDER STATUS
if ($_SERVER["REQUEST_METHOD"] === "PUT") {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!$data || !isset($data["order_id"]) || !isset($data["order_status"])) {

        echo json_encode([
            "success" => false,
            "message" => "Order ID or status missing"
        ]);

        exit;
    }

    $order_id = intval($data["order_id"]);
    $order_status = trim($data["order_status"]);


    $allowed_statuses = [
        "Pending",
        "Processing",
        "Completed"
    ];


    if (!in_array($order_status, $allowed_statuses)) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid order status"
        ]);

        exit;
    }


    $sql = "
        UPDATE orders
        SET order_status = ?
        WHERE id = ?
    ";


    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "si",
        $order_status,
        $order_id
    );


    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" => "Order status updated"
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Failed to update order status"
        ]);

    }


    $stmt->close();

    exit;
}


// GET ORDERS
$sql = "
    SELECT *
    FROM orders
    ORDER BY id DESC
";


$result = $conn->query($sql);

$orders = [];


if ($result) {

    while ($row = $result->fetch_assoc()) {

        $orders[] = $row;

    }

}


echo json_encode($orders);

?>