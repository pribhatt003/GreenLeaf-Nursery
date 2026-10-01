// ========================================
// GREENLEAF NURSERY - SHOP.JS
// ========================================


// ========================================
// CART DATA
// ========================================

let cart =
    JSON.parse(localStorage.getItem("greenLeafCart")) || [];

// ========================================
// LOAD PRODUCTS FROM DATABASE
// ========================================

fetch("backend/api/products.php")
    .then(function(response) {
        return response.json();
    })
    .then(function(products) {

        const productList =
            document.getElementById("productList");

        if (!productList) {
            return;
        }

        productList.innerHTML = "";

        products.forEach(function(product) {

            const productHTML = `
                <div class="col-lg-3 col-md-6 mb-4">

                    <div class="card product-card shadow-sm border-0 h-100">

                        <div class="position-relative">

                            <button
                                class="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle wishlist-btn"
                            >
                                <i class="bi bi-heart"></i>
                            </button>

                            <img
                                src="${product.image}"
                                class="card-img-top"
                                alt="${product.name}"
                            >

                        </div>

                        <div class="card-body">

                            <h5 class="fw-bold">
                                ${product.name}
                            </h5>

                            <p class="text-warning mb-2">
                                ⭐⭐⭐⭐⭐
                            </p>

                            <p class="text-muted">
                                ${product.description}
                            </p>

                            <h5 class="text-success">
                                ₹${product.price}
                            </h5>

                            <button
                                class="btn btn-success w-100 add-to-cart"
                                data-name="${product.name}"
                                data-id="${product.id}"
                                data-price="${product.price}"
                                data-image="${product.image}"
                            >
                                <i class="bi bi-cart-plus"></i>
                                Add To Cart
                            </button>

                        </div>

                    </div>

                </div>
            `;

            productList.innerHTML += productHTML;

        });

    })
    .catch(function(error) {

        console.error(
            "Products load nahi hue:",
            error
        );

    });

   // ========================================
// ADD TO CART FOR DATABASE PRODUCTS
// ========================================

document.addEventListener("click", function(event) {

    const button = event.target.closest(".add-to-cart");

    if (!button) {
        return;
    }

    const name = button.getAttribute("data-name");
    const productId = button.getAttribute("data-id");
    const price = parseFloat(button.getAttribute("data-price"));
    const image = button.getAttribute("data-image");

    if (!name || isNaN(price)) {
        return;
    }

    const existingItem = cart.find(function(item) {
        return item.product_id == productId;
    });

    // ========================================
    // PRODUCT ALREADY IN CART
    // ========================================

    if (existingItem) {

        existingItem.quantity += 1;

        fetch("backend/api/cart.php", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: existingItem.quantity
            })
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            console.log("Cart Update API:", data);

        })
        .catch(function(error) {

            console.error("Cart Update Error:", error);

        });

    }

    // ========================================
    // NEW PRODUCT
    // ========================================

    else {

        const newItem = {
            product_id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        };

        cart.push(newItem);

        fetch("backend/api/cart.php", {
            method: "POST",
            headers: {  
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id: productId,
                product_name: name,
                price: price,
                image: image,
                quantity: 1
            })
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            console.log("Cart Add API:", data);

        })
        .catch(function(error) {

            console.error("Cart Add Error:", error);

        });

    }

    // ========================================
    // SAVE LOCAL CART
    // ========================================

    localStorage.setItem(
        "greenLeafCart",
        JSON.stringify(cart)
    );

    // ========================================
    // BUTTON EFFECT
    // ========================================

    const oldText = button.innerHTML;

    button.innerHTML =
        '<i class="bi bi-check-circle-fill"></i> Added';

    button.disabled = true;

    setTimeout(function() {

        button.innerHTML = oldText;
        button.disabled = false;

    }, 1200);

});
// ========================================
// HEART BUTTON
// ========================================

const heartButtons =
    document.querySelectorAll(".heart-btn");


heartButtons.forEach(function(button) {


    button.addEventListener("click", function(event) {


        // Don't trigger other buttons

        event.preventDefault();

        event.stopPropagation();


        const icon =
            button.querySelector("i");


        if (!icon) {
            return;
        }


        // Normal heart → filled heart

        if (
            icon.classList.contains("bi-heart")
        ) {

            icon.classList.remove("bi-heart");

            icon.classList.add("bi-heart-fill");

            button.classList.add("heart-active");


        } else {


            // Filled heart → normal heart

            icon.classList.remove(
                "bi-heart-fill"
            );

            icon.classList.add(
                "bi-heart"
            );

            button.classList.remove(
                "heart-active"
            );

        }

    });

});



// ========================================
// SEARCH PLANTS
// ========================================

const searchInput =
    document.getElementById("searchPlant");


if (searchInput) {


    searchInput.addEventListener(
        "input",
        function() {


            const searchText =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const productCards =
                document.querySelectorAll(
                    ".product-card"
                );


            productCards.forEach(
                function(card) {


                    const nameElement =
                        card.querySelector("h5");


                    if (!nameElement) {
                        return;
                    }


                    const plantName =
                        nameElement.textContent
                            .toLowerCase();


                    const column =
                        card.closest(
                            ".col-lg-3, .col-md-4, .col-sm-6"
                        );


                    if (
                        plantName.includes(searchText)
                    ) {


                        if (column) {

                            column.style.display =
                                "";

                        } else {

                            card.style.display =
                                "";

                        }


                    } else {


                        if (column) {

                            column.style.display =
                                "none";

                        } else {

                            card.style.display =
                                "none";

                        }

                    }

                }
            );

        }
    );

}



// ========================================
// SEARCH WITH ENTER
// ========================================

if (searchInput) {


    searchInput.addEventListener(
        "keydown",
        function(event) {


            if (event.key === "Enter") {

                event.preventDefault();

            }

        }
    );

}



// ========================================
// PAGE LOADED
// ========================================

console.log(
    "GreenLeaf Shop JavaScript Loaded Successfully"
);
// ========================================
// WISHLIST HEART BUTTON
// ========================================

document.addEventListener("click", function(event) {

    const button =
        event.target.closest(".wishlist-btn");

    if (!button) {
        return;
    }

    const icon =
        button.querySelector("i");

    const productCard =
        button.closest(".product-card");

    if (!productCard) {
        return;
    }

    const addButton =
        productCard.querySelector(".add-to-cart");

    if (!addButton) {
        return;
    }

    const productId =
        addButton.getAttribute("data-id");

    const productName =
        addButton.getAttribute("data-name");

    const price =
        parseFloat(
            addButton.getAttribute("data-price")
        );

    const image =
        addButton.getAttribute("data-image");


    // ========================================
    // ALREADY IN WISHLIST → REMOVE
    // ========================================

    if (button.classList.contains("active")) {

        fetch("backend/api/wishlist.php", {

            method: "DELETE",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                product_id: productId
            })

        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            console.log(
                "Wishlist Remove:",
                data
            );

            if (data.success) {

                button.classList.remove("active");

                icon.classList.remove(
                    "bi-heart-fill"
                );

                icon.classList.add(
                    "bi-heart"
                );

            }

        })
        .catch(function(error) {

            console.error(
                "Wishlist Remove Error:",
                error
            );

        });

        return;
    }


    // ========================================
    // NOT IN WISHLIST → ADD
    // ========================================

    fetch("backend/api/wishlist.php", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            product_id: productId,
            product_name: productName,
            price: price,
            image: image

        })

    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        console.log(
            "Wishlist Add:",
            data
        );

        if (data.success) {

            button.classList.add("active");

            icon.classList.remove(
                "bi-heart"
            );

            icon.classList.add(
                "bi-heart-fill"
            );

        }

    })
    .catch(function(error) {

        console.error(
            "Wishlist Add Error:",
            error
        );

    });

});

// ========================================
// LOAD WISHLIST FROM DATABASE
// ========================================

fetch("backend/api/wishlist.php")
    .then(function(response) {
        return response.json();
    })
    .then(function(wishlist) {

        console.log("Wishlist Loaded:", wishlist);

        wishlist.forEach(function(item) {

            const buttons =
                document.querySelectorAll(".wishlist-btn");

            buttons.forEach(function(button) {

                const productCard =
                    button.closest(".product-card");

                if (!productCard) {
                    return;
                }

                const addButton =
                    productCard.querySelector(".add-to-cart");

                if (!addButton) {
                    return;
                }

                const productId =
                    addButton.getAttribute("data-id");

                if (productId == item.product_id) {

                    const icon =
                        button.querySelector("i");

                    button.classList.add("active");

                    icon.classList.remove("bi-heart");

                    icon.classList.add("bi-heart-fill");

                }

            });

        });

    })
    .catch(function(error) {

        console.error(
            "Wishlist Load Error:",
            error
        );

    });