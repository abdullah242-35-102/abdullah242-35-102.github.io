document.addEventListener("DOMContentLoaded", () => {
    // Responsive Navbar
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const navItems = document.querySelector(".items");

    hamburgerMenu.addEventListener("click", () => {
        navItems.classList.toggle("active");
    });

    // Add to Cart Functionality
    const cart = [];
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    const cartModal = document.createElement("div");
    cartModal.classList.add("cart-modal");
    document.body.appendChild(cartModal);

    addToCartButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const productCard = e.target.closest(".item-card");
            const productTitle = productCard.querySelector(".item-title").textContent;
            const productPrice = productCard.querySelector(".item-price").textContent;

            // Add product to cart
            cart.push({ title: productTitle, price: productPrice });
            updateCartModal();
        });
    });

    function updateCartModal() {
        cartModal.innerHTML = `
            <h2>Your Cart</h2>
            <ul>
                ${cart
                    .map(
                        (item) =>
                            `<li>${item.title} - <strong>${item.price}</strong></li>`
                    )
                    .join("")}
            </ul>
            <button class="close-cart">Close</button>
        `;
        cartModal.style.display = "block";

        // Close Cart Modal
        const closeCartButton = cartModal.querySelector(".close-cart");
        closeCartButton.addEventListener("click", () => {
            cartModal.style.display = "none";
        });
    }

    // Smooth Scroll for Categories
    const categoryLinks = document.querySelectorAll(".dropdown-content a");
    categoryLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // Search Functionality
    const searchInput = document.querySelector('input[type="search"]');
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const productCards = document.querySelectorAll(".item-card");

        productCards.forEach((card) => {
            const title = card.querySelector(".item-title").textContent.toLowerCase();
            if (title.includes(query)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});