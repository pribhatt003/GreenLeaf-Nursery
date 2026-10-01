<?php

require_once "../config/database.php";

$sql = "SELECT * FROM products";
$result = $conn->query($sql);

$products = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

header("Content-Type: application/json");

echo json_encode($products);

?>