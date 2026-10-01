<?php

require_once "../config/database.php";

header("Content-Type: application/json");


// ========================================
// GET CART ITEMS
// ========================================

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $sql = "SELECT * FROM cart ORDER BY id DESC";

    $result = $conn->query($sql);

    $cart = [];

    if ($result) {

        while ($row = $result->fetch_assoc()) {
            $cart[] = $row;
        }

    }

    echo json_encode($cart);

    exit;
}


// ========================================
// UPDATE CART QUANTITY
// ========================================

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

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


    $quantity = isset($data["quantity"])
        ? intval($data["quantity"])
        : 0;


    if ($quantity < 1) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid quantity"
        ]);

        exit;
    }


    // Product ID se update
    if (isset($data["product_id"])) {

        $product_id = intval($data["product_id"]);


        $sql = "UPDATE cart
                SET quantity = ?
                WHERE product_id = ?";


        $stmt = $conn->prepare($sql);


        $stmt->bind_param(
            "ii",
            $quantity,
            $product_id
        );


        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Cart quantity updated"
            ]);

        } else {

            echo json_encode([
                "success" => false,
                "message" => "Failed to update quantity"
            ]);

        }


        $stmt->close();

        exit;
    }


    // Agar database cart ID diya gaya ho
    if (isset($data["id"])) {

        $id = intval($data["id"]);


        $sql = "UPDATE cart
                SET quantity = ?
                WHERE id = ?";


        $stmt = $conn->prepare($sql);


        $stmt->bind_param(
            "ii",
            $quantity,
            $id
        );


        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Cart quantity updated"
            ]);

        } else {

            echo json_encode([
                "success" => false,
                "message" => "Failed to update quantity"
            ]);

        }


        $stmt->close();

        exit;
    }


    echo json_encode([
        "success" => false,
        "message" => "Product ID or Cart ID missing"
    ]);

    exit;
}


// ========================================
// ADD PRODUCT TO CART
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

    $quantity =
        intval($data["quantity"]);


    // ========================================
    // CHECK PRODUCT ALREADY EXISTS
    // ========================================

    $checkSql = "SELECT id, quantity
                 FROM cart
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

        // Product already exists
        $row =
            $result->fetch_assoc();


        $cartId =
            intval($row["id"]);


        $oldQuantity =
            intval($row["quantity"]);


        $newQuantity =
            $oldQuantity + $quantity;


        $updateSql =
            "UPDATE cart
             SET quantity = ?
             WHERE id = ?";


        $updateStmt =
            $conn->prepare($updateSql);


        $updateStmt->bind_param(
            "ii",
            $newQuantity,
            $cartId
        );


        if ($updateStmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Product quantity updated"
            ]);

        } else {

            echo json_encode([
                "success" => false,
                "message" => "Failed to update product"
            ]);

        }


        $updateStmt->close();

    } else {

        // New product
        $sql =
            "INSERT INTO cart
            (product_id, product_name, price, image, quantity)
            VALUES (?, ?, ?, ?, ?)";


        $stmt =
            $conn->prepare($sql);


        $stmt->bind_param(
            "isdsi",
            $product_id,
            $product_name,
            $price,
            $image,
            $quantity
        );


        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Product added to cart"
            ]);

        } else {

            echo json_encode([
                "success" => false,
                "message" => "Failed to add product"
            ]);

        }


        $stmt->close();
    }


    $checkStmt->close();

    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "DELETE") {

    $sql = "DELETE FROM cart";

    if ($conn->query($sql)) {
        echo json_encode([
            "success" => true,
            "message" => "Cart cleared successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to clear cart"
        ]);
    }

    exit;
}
// ========================================
// OTHER REQUESTS
// ========================================

echo json_encode([
    "success" => false,
    "message" => "Invalid request"
]);

?>