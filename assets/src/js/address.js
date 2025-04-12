document.addEventListener("DOMContentLoaded", () => {
    const addressForm = document.getElementById("address-form");
    const paymentOptions = document.getElementById("payment-options");

    // Handle Address Form Submission
    addressForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Collect address details
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const address = document.getElementById("address").value;

        // Save address details in localStorage
        localStorage.setItem("orderDetails", JSON.stringify({ name, email, phone, address }));

        // Hide the address form and show payment options
        addressForm.style.display = "none";
        paymentOptions.classList.remove("hidden");
    });

    // Handle Payment Option Selection
    paymentOptions.addEventListener("click", (e) => {
        if (e.target.classList.contains("payment-option")) {
            const paymentMethod = e.target.getAttribute("data-method");

            // Redirect to respective payment gateway
            if (paymentMethod === "cod") {
                alert("Order placed successfully! You chose Cash on Delivery.");
                generateReceipt("Cash on Delivery");
            } else if (paymentMethod === "bkash") {
                window.location.href = "bkash.html";
            } else if (paymentMethod === "nagad") {
                window.location.href = "nagad.html";
            }
        }
    });

    // Generate Payment Receipt
    function generateReceipt(paymentMethod) {
        const orderDetails = JSON.parse(localStorage.getItem("orderDetails"));
        const receipt = `
            <h1>Payment Receipt</h1>
            <p><strong>Name:</strong> ${orderDetails.name}</p>
            <p><strong>Email:</strong> ${orderDetails.email}</p>
            <p><strong>Phone:</strong> ${orderDetails.phone}</p>
            <p><strong>Address:</strong> ${orderDetails.address}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p>Thank you for your order!</p>
        `;
        document.body.innerHTML = receipt;
        localStorage.removeItem("orderDetails");
    }
});