<?php

require_once "../config/database.php";

header("Content-Type: application/json");


// ========================================
// GET WISHLIST
// ========================================

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $sql = "SELECT * FROM wishlist ORDER BY id DESC";

    $result = $conn->query($sql);

    $wishlist = [];

    if ($result) {

        while ($row = $result->fetch_assoc()) {
            $wishlist[] = $row;
        }

    }

    echo json_encode($wishlist);

    exit;
}


// ========================================
// REMOVE FROM WISHLIST
// ========================================

if ($_SERVER["REQUEST_METHOD"] === "DELETE") {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!$data || !isset($data["product_id"])) {

        echo json_encode([
            "success" => false,
            "message" => "Product ID missing"
        ]);

        exit;
    }

    $product_id =
        intval($data["product_id"]);


    $sql =
        "DELETE FROM wishlist
         WHERE product_id = ?";


    $stmt =
        $conn->prepare($sql);


    $stmt->bind_param(
        "i",
        $product_id
    );


    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" => "Product removed from wishlist"
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Failed to remove product"
        ]);

    }


    $stmt->close();

    exit;
}


// ========================================
// ADD TO WISHLIST
// ========================================

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );


    if (!$data) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid data"
        ]);

        exit;
    }


    $product_id =
        intval($data["product_id"]);

    $product_name =
        $data["product_name"];

    $price =
        floatval($data["price"]);

    $image =
        $data["image"];


    // ========================================
    // CHECK IF PRODUCT ALREADY EXISTS
    // ========================================

    $checkSql =
        "SELECT id FROM wishlist
         WHERE product_id = ?
         LIMIT 1";


    $checkStmt =
        $conn->prepare($checkSql);


    $checkStmt->bind_param(
        "i",
        $product_id
    );


    $checkStmt->execute();


    $result =
        $checkStmt->get_result();


    if ($result->num_rows > 0) {

        echo json_encode([
            "success" => false,
            "message" => "Product already in wishlist"
        ]);

        $checkStmt->close();

        exit;
    }


    // ========================================
    // ADD NEW WISHLIST ITEM
    // ========================================

    $sql =
        "INSERT INTO wishlist
        (product_id, product_name, price, image)
        VALUES (?, ?, ?, ?)";


    $stmt =
        $conn->prepare($sql);


    $stmt->bind_param(
        "isds",
        $product_id,
        $product_name,
        $price,
        $image
    );


    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" => "Product added to wishlist"
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Failed to add product"
        ]);

    }


    $stmt->close();
    $checkStmt->close();

    exit;
}


// ========================================
// INVALID REQUEST
// ========================================

echo json_encode([
    "success" => false,
    "message" => "Invalid request"
]);

?>