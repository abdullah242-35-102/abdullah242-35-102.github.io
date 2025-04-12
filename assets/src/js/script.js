document.addEventListener("DOMContentLoaded", () => {
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const navItems = document.querySelector(".items");

    hamburgerMenu.addEventListener("click", () => {
        navItems.classList.toggle("active");
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || []; // Load cart from localStorage
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

    // Add to Cart Functionality
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const productCard = e.target.closest(".item-card");
            const productTitle = productCard.querySelector(".item-title").textContent;
            const productPrice = productCard.querySelector(".item-price").textContent;

            // Add product to cart
            cart.push({ title: productTitle, price: productPrice });
            localStorage.setItem("cart", JSON.stringify(cart)); // Save cart to localStorage
            alert(`${productTitle} has been added to your cart!`);
        });
    });

    // Navigate to Cart Page
    const cartLink = document.querySelector('a[href="cartchek.html"]');
    cartLink.addEventListener("click", (e) => {
        if (cart.length === 0) {
            e.preventDefault();
            alert("Your cart is empty!");
        }
    });
});