document.addEventListener("DOMContentLoaded", function () {

    // Load Products Count
    fetch("../backend/api/products.php")
        .then(function (response) {
            return response.json();
        })
        .then(function (products) {

            document.getElementById("totalProducts").textContent =
                products.length;

        })
        .catch(function (error) {

            console.error(
                "Products Load Error:",
                error
            );

        });


    // Load Orders
    fetch("../backend/api/orders-list.php")
        .then(function (response) {
            return response.json();
        })
        .then(function (orders) {

            const ordersTable =
                document.getElementById("ordersTable");

            const totalOrders =
                document.getElementById("totalOrders");

            const pendingOrders =
                document.getElementById("pendingOrders");


            totalOrders.textContent =
                orders.length;


            const pendingCount =
                orders.filter(function (order) {
                    return order.order_status === "Pending";
                }).length;

            pendingOrders.textContent =
                pendingCount;


            ordersTable.innerHTML = "";


            if (orders.length === 0) {

                ordersTable.innerHTML = `
                    <tr>
                        <td colspan="8"
                            class="text-center text-muted">
                            No orders found.
                        </td>
                    </tr>
                `;

                return;
            }


            orders.forEach(function (order) {

                ordersTable.innerHTML += `
                    <tr>

                        <td>
                            <strong>
                                #${order.id}
                            </strong>
                        </td>

                        <td>
                            ${order.customer_name}
                        </td>

                        <td>
                            ${order.email}
                        </td>

                        <td>
                            ${order.phone}
                        </td>

                        <td>
                            ₹${parseFloat(order.total_amount).toFixed(2)}
                        </td>

                        <td>
    <select
        class="form-select form-select-sm order-status"
        data-id="${order.id}"
    >
        <option value="Pending"
            ${order.order_status === "Pending" ? "selected" : ""}>
            Pending
        </option>

        <option value="Processing"
            ${order.order_status === "Processing" ? "selected" : ""}>
            Processing
        </option>

        <option value="Completed"
            ${order.order_status === "Completed" ? "selected" : ""}>
            Completed
        </option>
    </select>
</td>

                        <td>
                            ${order.created_at}
                        </td>
                       <td>
    <button
        type="button"
        class="btn btn-sm btn-success view-order-details"
        data-id="${order.id}"
    >
        👁 View Details
    </button>

    <button
    type="button"
    class="btn btn-sm btn-danger delete-order"
    data-id="${order.id}"
>
    🗑 Delete
</button>
</td>

                    </tr>
                `;

            });

        })
        .catch(function (error) {

            console.error(
                "Orders Load Error:",
                error
            );

        });

});
document.addEventListener("change", function (event) {

    const dropdown =
        event.target.closest(".order-status");

    if (!dropdown) {
        return;
    }

    const orderId =
        dropdown.getAttribute("data-id");

    const orderStatus =
        dropdown.value;


    fetch("../backend/api/orders-list.php", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            order_id: orderId,

            order_status: orderStatus

        })

    })
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {

        console.log(
            "Status Update:",
            data
        );

        if (data.success) {

            alert(
                "Order status updated successfully!"
            );

        } else {

            alert(
                "Status update failed: "
                + data.message
            );

        }

    })
    .catch(function (error) {

        console.error(
            "Status Update Error:",
            error
        );

        alert(
            "Something went wrong while updating status."
        );

    });

}); 
document.addEventListener("click", function (event) {

    const button =
        event.target.closest(".view-order-details");

    if (!button) {
        return;
    }

    const orderId =
        button.getAttribute("data-id");


    fetch(
        "../backend/api/order-details.php?order_id="
        + orderId
    )
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {

        console.log(
            "Order Details:",
            data
        );


        if (!data.success) {

            alert(
                "Could not load order details."
            );

            return;
        }


        const order = data.order;
        const items = data.items;


        // =========================
        // CUSTOMER INFORMATION
        // =========================

        let details = `

            <div class="mb-4">

                <h6 class="fw-bold text-success mb-3">
                    <i class="bi bi-person-circle"></i>
                    Customer Information
                </h6>

                <div class="border rounded p-3">

                    <p class="mb-2">
                        <strong>Name:</strong>
                        ${order.customer_name}
                    </p>

                    <p class="mb-2">
                        <strong>Email:</strong>
                        ${order.email}
                    </p>

                    <p class="mb-2">
                        <strong>Phone:</strong>
                        ${order.phone}
                    </p>

                    <p class="mb-0">
                        <strong>Address:</strong><br>
                        ${order.address}
                    </p>

                </div>

            </div>


            <div class="mb-3">

                <h6 class="fw-bold text-success mb-3">
                    <i class="bi bi-cart-check"></i>
                    Ordered Products
                </h6>

        `;


        // =========================
        // ORDER PRODUCTS
        // =========================

        if (items.length === 0) {

            details += `
                <div class="alert alert-warning">
                    No products found for this order.
                </div>
            `;

        } else {

            items.forEach(function (item) {

                details += `

                    <div class="border rounded p-3 mb-3">

                        <h6 class="fw-bold text-success">
                            ${item.product_name}
                        </h6>

                        <div class="row">

                            <div class="col-6">

                                <small class="text-muted">
                                    Price
                                </small>

                                <div>
                                    ₹${parseFloat(item.price).toFixed(2)}
                                </div>

                            </div>

                            <div class="col-6">

                                <small class="text-muted">
                                    Quantity
                                </small>

                                <div>
                                    ${item.quantity}
                                </div>

                            </div>

                        </div>

                        <hr>

                        <div class="d-flex justify-content-between">

                            <strong>
                                Subtotal
                            </strong>

                            <strong class="text-success">
                                ₹${parseFloat(item.subtotal).toFixed(2)}
                            </strong>

                        </div>

                    </div>

                `;

            });

        }


        // =========================
        // ORDER SUMMARY
        // =========================

        details += `

            </div>

            <div class="border rounded p-3 bg-light">

                <div class="d-flex justify-content-between mb-2">

                    <strong>
                        Order Status
                    </strong>

                    <span class="badge bg-success">
                        ${order.order_status}
                    </span>

                </div>

                <div class="d-flex justify-content-between">

                    <strong>
                        Total Amount
                    </strong>

                    <strong class="text-success fs-5">
                        ₹${parseFloat(order.total_amount).toFixed(2)}
                    </strong>

                </div>

            </div>

        `;


        document.getElementById(
            "orderDetailsContent"
        ).innerHTML = details;


        // =========================
        // OPEN MODAL
        // =========================

        const modalElement =
            document.getElementById(
                "orderDetailsModal"
            );

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );

        modal.show();

    })
    .catch(function (error) {

        console.error(
            "Order Details Error:",
            error
        );

        alert(
            "Something went wrong while loading order details."
        );

    });

});
// =========================
// SEARCH ORDERS
// =========================

document.addEventListener("DOMContentLoaded", function () {

    const searchInput =
        document.getElementById("orderSearch");

    const ordersTable =
        document.getElementById("ordersTable");


    if (!searchInput || !ordersTable) {
        return;
    }


    searchInput.addEventListener("input", function () {

        const searchText =
            searchInput.value.toLowerCase().trim();

        const rows =
            ordersTable.querySelectorAll("tr");


        rows.forEach(function (row) {

            const rowText =
                row.textContent.toLowerCase();

            if (rowText.includes(searchText)) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        });

    });

});
// =========================
// DELETE ORDER
// =========================

document.addEventListener("click", function (event) {

    const button =
        event.target.closest(".delete-order");

    if (!button) {
        return;
    }

    const orderId =
        button.getAttribute("data-id");

    const confirmDelete =
        confirm(
            "Are you sure you want to delete Order #" +
            orderId +
            "?"
        );

    if (!confirmDelete) {
        return;
    }

    fetch("../backend/api/delete-order.php", {

        method: "DELETE",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            order_id: orderId
        })

    })
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {

        if (data.success) {

            alert("Order deleted successfully!");

            location.reload();

        } else {

            alert(
                "Order delete failed: " +
                data.message
            );

        }

    })
    .catch(function (error) {

        console.error(
            "Delete Order Error:",
            error
        );

        alert(
            "Something went wrong while deleting the order."
        );

    });

});