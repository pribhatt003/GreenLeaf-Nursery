// ========================================
// GREENLEAF NURSERY - CART.JS
// ========================================


// ========================================
// GET CART DATA
// ========================================

let cart =
    JSON.parse(localStorage.getItem("greenLeafCart")) || [];


// ========================================
// HTML ELEMENTS
// ========================================

const cartItems =
    document.getElementById("cartItems");

const emptyCart =
    document.getElementById("emptyCart");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const cartItemCount =
    document.getElementById("cartItemCount");

const checkoutBtn =
    document.getElementById("checkoutBtn");


// ========================================
// SHOW CART
// ========================================

function displayCart() {


    // Clear old products

    cartItems.innerHTML = "";


    // If cart is empty

    if (cart.length === 0) {

        emptyCart.classList.remove("d-none");

        cartSubtotal.textContent = "₹0";

        cartTotal.textContent = "₹0";

        cartItemCount.textContent = "0 Items";

        checkoutBtn.disabled = true;

        return;

    }


    // Cart has products

    emptyCart.classList.add("d-none");

    checkoutBtn.disabled = false;


    let total = 0;

    let quantityTotal = 0;


    // ========================================
    // CREATE EACH CART ITEM
    // ========================================

    cart.forEach(function(item, index) {


        const itemTotal =
            item.price * item.quantity;


        total += itemTotal;

        quantityTotal += item.quantity;


        const product =
            document.createElement("div");


        product.className =
            "cart-product";


        product.innerHTML = `

            <div class="cart-product-image">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

            </div>


            <div class="cart-product-details">

                <h5>
                    ${item.name}
                </h5>

                <p>
                    ₹${item.price}
                </p>


                <div class="quantity-box">

                    <button
                        class="quantity-btn"
                        onclick="decreaseQuantity(${index})"
                    >
                        −
                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button
                        class="quantity-btn"
                        onclick="increaseQuantity(${index})"
                    >
                        +
                    </button>

                </div>

            </div>


            <div class="cart-product-right">

                <strong>
                    ₹${itemTotal}
                </strong>


                <button
                    class="remove-btn"
                    onclick="removeItem(${index})"
                    title="Remove item"
                >

                    <i class="bi bi-trash3"></i>

                </button>

            </div>

        `;


        cartItems.appendChild(product);

    });


    // ========================================
    // UPDATE TOTALS
    // ========================================

    cartSubtotal.textContent =
        "₹" + total;


    cartTotal.textContent =
        "₹" + total;


    cartItemCount.textContent =
        quantityTotal +
        (
            quantityTotal === 1
                ? " Item"
                : " Items"
        );

}

// ========================================
// INCREASE QUANTITY
// ========================================

function increaseQuantity(index) {

    const item = cart[index];

    item.quantity++;

    fetch("backend/api/cart.php", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            product_id: item.product_id,
            quantity: item.quantity
        })

    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        console.log("Increase Quantity:", data);

    })
    .catch(function(error) {

        console.error(
            "Increase Quantity Error:",
            error
        );

    });

    saveCart();
}


// ========================================
// DECREASE QUANTITY
// ========================================

function decreaseQuantity(index) {

    const item = cart[index];

    if (item.quantity > 1) {

        item.quantity--;

        fetch("backend/api/cart.php", {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                product_id: item.product_id,
                quantity: item.quantity
            })

        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            console.log("Decrease Quantity:", data);

        })
        .catch(function(error) {

            console.error(
                "Decrease Quantity Error:",
                error
            );

        });

    } else {

        removeItem(index);
        return;

    }

    saveCart();
}


// ========================================
// REMOVE PRODUCT
// ========================================

function removeItem(index) {

    const item = cart[index];

    console.log("Remove item:", item);

    fetch("backend/api/cart.php", {

        method: "DELETE",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            product_id: item.product_id
        })

    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        console.log("Remove Cart API:", data);

        if (data.success) {

            cart.splice(index, 1);

            saveCart();

        } else {

            console.error(
                "Remove failed:",
                data.message
            );

        }

    })
    .catch(function(error) {

        console.error(
            "Remove Cart Error:",
            error
        );

    });

}

// ========================================
// SAVE CART
// ========================================

function saveCart() {

    localStorage.setItem(
        "greenLeafCart",
        JSON.stringify(cart)
    );

    displayCart();
}

    // ========================================
// LOAD CART FROM DATABASE
// ========================================

fetch("backend/api/cart.php")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        console.log("Database Cart:", data);

        if (Array.isArray(data)) {

            cart = data.map(function(item) {

                return {
                    id: item.id,
                    product_id: item.product_id,
                    name: item.product_name,
                    price: parseFloat(item.price),
                    image: item.image,
                    quantity: parseInt(item.quantity)
                };

            });

            localStorage.setItem(
                "greenLeafCart",
                JSON.stringify(cart)
            );

            displayCart();

        }

    })
    .catch(function(error) {

        console.error(
            "Database Cart Error:",
            error
        );

        displayCart();

    });





// ========================================
// CHECKOUT
// ========================================

if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        function() {

            if (cart.length === 0) {
                return;
            }

        
                window.location.href = "checkout.html";
            

        }
    );

}


// ========================================
// LOAD CART
// ========================================

displayCart();



// ========================================
// LOAD CART
// ========================================

displayCart();
