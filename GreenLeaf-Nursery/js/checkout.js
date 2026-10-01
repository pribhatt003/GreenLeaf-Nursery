document.addEventListener("DOMContentLoaded", function () {

    const checkoutItems =
        document.getElementById("checkoutItems");

    const checkoutTotal =
        document.getElementById("checkoutTotal");

    const checkoutForm =
        document.getElementById("checkoutForm");

    let cartItems = [];


    // ========================================
    // LOAD CART
    // ========================================

    fetch("backend/api/cart.php")
        .then(function (response) {
            return response.json();
        })
        .then(function (cart) {

            console.log("Database Cart:", cart);

            // Agar database se cart empty aaye,
            // to localStorage se cart load karo
            if (!Array.isArray(cart) || cart.length === 0) {

                const localCart =
                    JSON.parse(
                        localStorage.getItem("greenLeafCart")
                    ) || [];

                console.log(
                    "LocalStorage Cart:",
                    localCart
                );

                if (localCart.length > 0) {
                    cart = localCart;
                }
            }


            // Cart ko save karo
            cartItems = cart;


            // Purane checkout items clear karo
            checkoutItems.innerHTML = "";


            // ========================================
            // EMPTY CART
            // ========================================

            if (cartItems.length === 0) {

                checkoutItems.innerHTML = `
                    <p class="text-muted">
                        Your cart is empty.
                    </p>

                    <a href="shop.html"
                       class="btn btn-success w-100">
                        Go To Shop
                    </a>
                `;

                checkoutForm.style.display = "none";

                checkoutTotal.textContent = "₹0";

                return;
            }


            // ========================================
            // SHOW CART PRODUCTS
            // ========================================

            let total = 0;


            cartItems.forEach(function (item) {

                const price =
                    parseFloat(item.price);

                const quantity =
                    parseInt(item.quantity);

                const subtotal =
                    price * quantity;

                total += subtotal;


                // Database me product_name
                // localStorage me name ho sakta hai
                const productName =
                    item.product_name || item.name;


                checkoutItems.innerHTML += `
                    <div class="d-flex justify-content-between align-items-center mb-3">

                        <div class="text-start">

                            <strong>
                                ${productName}
                            </strong>

                            <div class="text-muted">
                                ₹${price} × ${quantity}
                            </div>

                        </div>

                        <strong>
                            ₹${subtotal.toFixed(2)}
                        </strong>

                    </div>
                `;
            });


            // Total show karo
            checkoutTotal.textContent =
                "₹" + total.toFixed(2);

        })
        .catch(function (error) {

            console.error(
                "Checkout Cart Error:",
                error
            );

        });


    // ========================================
    // PLACE ORDER
    // ========================================

    checkoutForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // Cart empty hai
            if (cartItems.length === 0) {

                alert("Your cart is empty!");

                return;
            }


            // ========================================
            // CUSTOMER DETAILS
            // ========================================

            const customerName =
                document
                    .getElementById("customerName")
                    .value
                    .trim();


            const customerEmail =
                document
                    .getElementById("customerEmail")
                    .value
                    .trim();


            const customerPhone =
                document
                    .getElementById("customerPhone")
                    .value
                    .trim();


            const customerAddress =
                document
                    .getElementById("customerAddress")
                    .value
                    .trim();


            // ========================================
            // PREPARE ORDER ITEMS
            // ========================================

            let totalAmount = 0;


            const items =
                cartItems.map(function (item) {

                    const price =
                        parseFloat(item.price);

                    const quantity =
                        parseInt(item.quantity);

                    const subtotal =
                        price * quantity;

                    totalAmount += subtotal;


                    return {

                        product_id:
                            parseInt(item.product_id),

                        product_name:
                            item.product_name || item.name,

                        price:
                            price,

                        quantity:
                            quantity

                    };

                });


            // ========================================
            // SEND ORDER
            // ========================================

            fetch("backend/api/orders.php", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    customer_name:
                        customerName,

                    email:
                        customerEmail,

                    phone:
                        customerPhone,

                    address:
                        customerAddress,

                    total_amount:
                        totalAmount,

                    items:
                        items

                })

            })

            .then(function (response) {
                return response.json();
            })

            .then(function (data) {

                console.log(
                    "Order Response:",
                    data
                );


                // ========================================
                // ORDER SUCCESS
                // ========================================

                if (data.success) {


                    // Database cart clear karo
                    fetch(
                        "backend/api/cart.php",
                        {
                            method: "DELETE"
                        }
                    )

                    .then(function (response) {
                        return response.json();
                    })

                    .then(function (cartData) {

                        console.log(
                            "Cart Clear Response:",
                            cartData
                        );


                        // Success message
                        alert(
                            "Order placed successfully! Order ID: "
                            + data.order_id
                        );


                        // Local cart clear
                        localStorage.removeItem(
                            "greenLeafCart"
                        );


                        // Order ID save
                        localStorage.setItem(
                            "greenLeafOrderId",
                            data.order_id
                        );


                        // Success page
                        window.location.href =
                            "order-success.html";

                    })

                    .catch(function (error) {

                        console.error(
                            "Cart Clear Error:",
                            error
                        );

                        alert(
                            "Order placed, but cart could not be cleared."
                        );

                    });


                } else {

                    alert(
                        "Order failed: "
                        + data.message
                    );

                }

            })

            .catch(function (error) {

                console.error(
                    "Order Error:",
                    error
                );

                alert(
                    "Something went wrong while placing the order."
                );

            });

        }
    );

});