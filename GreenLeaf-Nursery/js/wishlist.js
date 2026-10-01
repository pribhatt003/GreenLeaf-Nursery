document.addEventListener("DOMContentLoaded", function () {

    fetch("backend/api/wishlist.php")
        .then(function (response) {
            return response.json();
        })
        .then(function (wishlist) {

            const wishlistList =
                document.getElementById("wishlistList");

            const emptyWishlist =
                document.getElementById("emptyWishlist");

            if (!wishlistList) {
                return;
            }

            wishlistList.innerHTML = "";

            if (wishlist.length === 0) {
                emptyWishlist.style.display = "block";
                return;
            }

            emptyWishlist.style.display = "none";

            wishlist.forEach(function (item) {

                const productHTML = `
                    <div class="col-lg-3 col-md-6 mb-4">

                        <div class="card product-card shadow-sm border-0 h-100">

                            <img
                                src="${item.image}"
                                class="card-img-top"
                                alt="${item.product_name}"
                            >

                            <div class="card-body">

                                <h5 class="fw-bold">
                                    ${item.product_name}
                                </h5>

                                <p class="text-warning mb-2">
                                    ⭐⭐⭐⭐⭐
                                </p>

                                <h5 class="text-success mb-3">
                                    ₹${item.price}
                                </h5>

                                <button
                                    class="btn btn-success w-100 mb-2 add-wishlist-cart"
                                    data-id="${item.product_id}"
                                    data-name="${item.product_name}"
                                    data-price="${item.price}"
                                    data-image="${item.image}"
                                >
                                    <i class="bi bi-cart-plus"></i>
                                    Add To Cart
                                </button>

                                <button
                                    class="btn btn-outline-danger w-100 remove-wishlist"
                                    data-id="${item.product_id}"
                                >
                                    <i class="bi bi-trash"></i>
                                    Remove
                                </button>

                            </div>

                        </div>

                    </div>
                `;

                wishlistList.innerHTML += productHTML;
            });
        })
        .catch(function (error) {
            console.error("Wishlist Load Error:", error);
        });


    // Remove from wishlist
    document.addEventListener("click", function (event) {

        const button =
            event.target.closest(".remove-wishlist");

        if (!button) {
            return;
        }

        const productId =
            button.getAttribute("data-id");

        fetch("backend/api/wishlist.php", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id: productId
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            console.log("Wishlist Remove:", data);

            if (data.success) {
                location.reload();
            }

        })
        .catch(function (error) {
            console.error("Wishlist Remove Error:", error);
        });

    });


    // Add wishlist product to cart
    document.addEventListener("click", function (event) {

        const button =
            event.target.closest(".add-wishlist-cart");

        if (!button) {
            return;
        }

        const productId =
            button.getAttribute("data-id");

        const productName =
            button.getAttribute("data-name");

        const price =
            parseFloat(button.getAttribute("data-price"));

        const image =
            button.getAttribute("data-image");


        fetch("backend/api/cart.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id: productId,
                product_name: productName,
                price: price,
                image: image,
                quantity: 1
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            console.log("Wishlist Cart:", data);

            if (data.success) {
                alert(productName + " added to cart!");
            }

        })
        .catch(function (error) {
            console.error("Wishlist Cart Error:", error);
        });

    });

});