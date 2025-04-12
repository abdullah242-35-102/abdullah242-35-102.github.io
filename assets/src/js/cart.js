document.addEventListener("DOMContentLoaded", () => {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-btn");
    const clearCartButton = document.getElementById("clear-cart-btn");

    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Display Cart Items
    function displayCartItems() {
        cartItemsContainer.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            cartTotalElement.textContent = "";
            return;
        }

        cart.forEach((item, index) => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            itemElement.innerHTML = `
                <p>${item.title} - <strong>${item.price}</strong></p>
                <button class="remove-btn" data-index="${index}">Remove</button>
            `;
            cartItemsContainer.appendChild(itemElement);

            const price = parseFloat(item.price.replace("$", ""));
            total += price;
        });

        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Remove Item from Cart
    cartItemsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-btn")) {
            const index = e.target.getAttribute("data-index");
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            displayCartItems();
        }
    });

    // Checkout Process
    checkoutButton.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
         // Redirect to the Give Address page
    window.location.href = "giveaddress.html"; 
        alert("Thank you for your purchase!");
        localStorage.removeItem("cart");
        displayCartItems();
    });

    // Clear Cart
    clearCartButton.addEventListener("click", () => {
        localStorage.removeItem("cart");
        cart.length = 0;
        displayCartItems();
    });

    // Initial Display
    displayCartItems();
});