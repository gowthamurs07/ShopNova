/* =====================================================
   GLOBAL STATE
===================================================== */

let products = [];

let filteredProducts = [];

let cart = JSON.parse(
    localStorage.getItem("shopnova_cart")
) || [];

let wishlist = JSON.parse(
    localStorage.getItem("shopnova_wishlist")
) || [];

let currentCategory = "All";

let currentSearch = "";

let visibleProducts = 8;

let couponDiscount = 0;

let saleEndTime =
    localStorage.getItem("shopnova_sale_end");

let toastTimer;


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initialize();

    }
);


async function initialize() {

    await loadProducts();

    loadDarkMode();

    updateCart();

    updateWishlistCount();

    setupSearch();

    startCountdown();

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    try {

        const response =
            await fetch("/api/products");

        const data =
            await response.json();

        if (!data.success) {
            throw new Error(
                "Could not load products"
            );
        }

        products = data.products;

        filteredProducts = [...products];

        renderProducts();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load products.",
            "error"
        );

    }

}


/* =====================================================
   PRODUCT RENDERING
===================================================== */

function renderProducts() {

    const grid =
        document.getElementById(
            "products-grid"
        );

    const noProducts =
        document.getElementById(
            "no-products"
        );

    const count =
        document.getElementById(
            "product-count"
        );

    grid.innerHTML = "";


    if (
        filteredProducts.length === 0
    ) {

        noProducts.classList.remove(
            "hidden"
        );

        count.textContent =
            "0 products found";

        document
            .getElementById(
                "load-more-btn"
            )
            .style.display = "none";

        return;

    }


    noProducts.classList.add(
        "hidden"
    );


    const visible =
        filteredProducts.slice(
            0,
            visibleProducts
        );


    count.textContent =
        `Showing ${visible.length} of ${filteredProducts.length} products`;


    visible.forEach(product => {

        grid.appendChild(
            createProductCard(product)
        );

    });


    const loadMore =
        document.getElementById(
            "load-more-btn"
        );


    if (
        visibleProducts >=
        filteredProducts.length
    ) {

        loadMore.style.display =
            "none";

    } else {

        loadMore.style.display =
            "inline-block";

    }

}


/* =====================================================
   PRODUCT CARD
===================================================== */

function createProductCard(product) {

    const card =
        document.createElement("article");

    card.className =
        "product-card";


    const isWishlisted =
        wishlist.includes(product.id);


    card.innerHTML = `

        <div class="product-image">

            <img
                src="${product.image}"
                alt="${escapeHTML(product.name)}"
                loading="lazy"
            >

            <span class="product-badge">
                ${escapeHTML(product.badge)}
            </span>


            <button
                class="wishlist-btn ${
                    isWishlisted
                        ? "active"
                        : ""
                }"
                onclick="toggleWishlist(
                    ${product.id}
                )"
                aria-label="Wishlist"
            >
                ${
                    isWishlisted
                        ? "♥"
                        : "♡"
                }
            </button>

        </div>


        <div class="product-info">

            <span class="product-category">
                ${escapeHTML(product.category)}
            </span>

            <h3 class="product-name">
                ${escapeHTML(product.name)}
            </h3>


            <div class="product-rating">

                <span class="stars">
                    ${createStars(product.rating)}
                </span>

                <span class="rating-count">
                    ${product.rating}
                    (${product.reviews})
                </span>

            </div>


            <div class="price-row">

                <span class="price">
                    ₹${formatMoney(product.price)}
                </span>

                <span class="old-price">
                    ₹${formatMoney(product.old_price)}
                </span>

                <span class="discount">
                    ${product.discount}% OFF
                </span>

            </div>


            <div class="product-actions">

                <button
                    class="add-cart"
                    onclick="addToCart(
                        ${product.id}
                    )"
                >
                    🛒 Add to Cart
                </button>

                <button
                    class="quick-view"
                    onclick="openProductModal(
                        ${product.id}
                    )"
                    title="Quick View"
                >
                    👁
                </button>

            </div>

        </div>
    `;


    return card;
}


/* =====================================================
   STARS
===================================================== */

function createStars(rating) {

    let html = "";

    for (let i = 1; i <= 5; i++) {

        if (rating >= i) {

            html += "★";

        } else if (
            rating >= i - 0.5
        ) {

            html += "★";

        } else {

            html += "☆";

        }

    }

    return html;
}


/* =====================================================
   SEARCH
===================================================== */

function setupSearch() {

    const input =
        document.getElementById(
            "search-input"
        );


    input.addEventListener(
        "input",
        function () {

            currentSearch =
                this.value
                    .trim()
                    .toLowerCase();


            const clear =
                document.querySelector(
                    ".clear-search"
                );


            clear.style.display =
                currentSearch
                    ? "block"
                    : "none";


            showSearchSuggestions(
                currentSearch
            );

            applyFilters();

        }
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                performSearch();

            }

        }
    );

}


function showSearchSuggestions(query) {

    const container =
        document.getElementById(
            "search-suggestions"
        );


    if (!query) {

        container.style.display =
            "none";

        return;

    }


    const matches =
        products
            .filter(product =>
                product.name
                    .toLowerCase()
                    .includes(query)
            )
            .slice(0, 5);


    if (!matches.length) {

        container.innerHTML = `
            <div class="suggestion-item">
                No matching products
            </div>
        `;

    } else {

        container.innerHTML =
            matches
                .map(product => `

                    <div
                        class="suggestion-item"
                        onclick="selectSuggestion(
                            ${product.id}
                        )"
                    >

                        <span>
                            ${escapeHTML(
                                product.name
                            )}
                        </span>

                        <strong>
                            ₹${formatMoney(
                                product.price
                            )}
                        </strong>

                    </div>

                `)
                .join("");

    }


    container.style.display =
        "block";
}


function selectSuggestion(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) {
        return;
    }


    document.getElementById(
        "search-input"
    ).value = product.name;


    currentSearch =
        product.name.toLowerCase();


    document.getElementById(
        "search-suggestions"
    ).style.display = "none";


    applyFilters();

    scrollToProducts();

}


function performSearch() {

    currentSearch =
        document.getElementById(
            "search-input"
        ).value
            .trim()
            .toLowerCase();


    document.getElementById(
        "search-suggestions"
    ).style.display = "none";


    visibleProducts = 8;

    applyFilters();

    scrollToProducts();

}


function focusSearch() {

    document
        .getElementById(
            "search-input"
        )
        .focus();

}


function clearSearch() {

    document.getElementById(
        "search-input"
    ).value = "";

    currentSearch = "";

    document.querySelector(
        ".clear-search"
    ).style.display = "none";

    applyFilters();

}


/* =====================================================
   FILTER
===================================================== */

function filterCategory(category) {

    currentCategory = category;

    visibleProducts = 8;

    document.querySelectorAll(
        ".filter-btn"
    ).forEach(btn => {

        btn.classList.toggle(
            "active",
            btn.dataset.category ===
                category
        );

    });


    applyFilters();

    scrollToProducts();

}


function applyFilters() {

    filteredProducts =
        products.filter(product => {

            const categoryMatch =
                currentCategory === "All" ||
                product.category ===
                    currentCategory;


            const searchMatch =
                !currentSearch ||

                product.name
                    .toLowerCase()
                    .includes(currentSearch) ||

                product.category
                    .toLowerCase()
                    .includes(currentSearch) ||

                product.brand
                    .toLowerCase()
                    .includes(currentSearch);


            return (
                categoryMatch &&
                searchMatch
            );

        });


    sortProducts(false);

}


/* =====================================================
   SORT
===================================================== */

function sortProducts(render = true) {

    const sort =
        document.getElementById(
            "sort-select"
        ).value;


    switch (sort) {

        case "price-low":

            filteredProducts.sort(
                (a, b) =>
                    a.price - b.price
            );

            break;


        case "price-high":

            filteredProducts.sort(
                (a, b) =>
                    b.price - a.price
            );

            break;


        case "rating":

            filteredProducts.sort(
                (a, b) =>
                    b.rating - a.rating
            );

            break;


        case "discount":

            filteredProducts.sort(
                (a, b) =>
                    b.discount - a.discount
            );

            break;


        default:

            filteredProducts.sort(
                (a, b) =>
                    a.id - b.id
            );

    }


    if (render) {

        visibleProducts = 8;

        renderProducts();

    } else {

        renderProducts();

    }

}


/* =====================================================
   LOAD MORE
===================================================== */

function loadMoreProducts() {

    visibleProducts += 4;

    renderProducts();

}


/* =====================================================
   SHOW ALL
===================================================== */

function showAllProducts() {

    currentCategory = "All";

    currentSearch = "";

    visibleProducts = 8;


    document.getElementById(
        "search-input"
    ).value = "";


    document.querySelector(
        ".clear-search"
    ).style.display = "none";


    document.querySelectorAll(
        ".filter-btn"
    ).forEach(btn => {

        btn.classList.toggle(
            "active",
            btn.dataset.category ===
                "All"
        );

    });


    applyFilters();

    scrollToProducts();

}


function showDeals() {

    filteredProducts =
        products.filter(
            product =>
                product.discount >= 30
        );


    currentCategory = "All";

    currentSearch = "";

    visibleProducts =
        filteredProducts.length;


    renderProducts();

    scrollToProducts();

}


/* =====================================================
   CART
===================================================== */

function addToCart(productId) {

    const product =
        products.find(
            p => p.id === productId
        );


    if (!product) {
        return;
    }


    const existing =
        cart.find(
            item =>
                item.id === productId
        );


    if (existing) {

        if (
            existing.quantity <
            product.stock
        ) {

            existing.quantity++;

        } else {

            showToast(
                "Maximum available stock reached.",
                "error"
            );

            return;
        }

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });

    }


    saveCart();

    updateCart();

    showToast(
        `${product.name} added to cart!`,
        "success"
    );

}


function updateCart() {

    const count =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    document.getElementById(
        "cart-count"
    ).textContent = count;


    renderCart();

}


function renderCart() {

    const container =
        document.getElementById(
            "cart-items"
        );


    const empty =
        document.getElementById(
            "empty-cart"
        );


    const summary =
        document.getElementById(
            "cart-summary"
        );


    container.innerHTML = "";


    if (!cart.length) {

        empty.classList.remove(
            "hidden"
        );

        summary.classList.add(
            "hidden"
        );

        return;

    }


    empty.classList.add(
        "hidden"
    );

    summary.classList.remove(
        "hidden"
    );


    cart.forEach(item => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "cart-item";


        div.innerHTML = `

            <div class="cart-item-image">

                <img
                    src="${item.image}"
                    alt="${escapeHTML(
                        item.name
                    )}"
                >

            </div>


            <div class="cart-item-info">

                <h4>
                    ${escapeHTML(
                        item.name
                    )}
                </h4>

                <div class="cart-item-price">
                    ₹${formatMoney(
                        item.price
                    )}
                </div>


                <div class="quantity-control">

                    <button
                        onclick="changeQuantity(
                            ${item.id},
                            -1
                        )"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="changeQuantity(
                            ${item.id},
                            1
                        )"
                    >
                        +
                    </button>

                </div>

            </div>


            <button
                class="remove-cart"
                onclick="removeFromCart(
                    ${item.id}
                )"
            >
                ×
            </button>

        `;


        container.appendChild(div);

    });


    updateCartSummary();

}


function changeQuantity(
    productId,
    change
) {

    const item =
        cart.find(
            item =>
                item.id === productId
        );


    if (!item) {
        return;
    }


    const product =
        products.find(
            p =>
                p.id === productId
        );


    item.quantity += change;


    if (
        product &&
        item.quantity >
            product.stock
    ) {

        item.quantity =
            product.stock;

        showToast(
            "Maximum stock reached.",
            "error"
        );

    }


    if (
        item.quantity <= 0
    ) {

        cart =
            cart.filter(
                item =>
                    item.id !==
                    productId
            );

    }


    saveCart();

    updateCart();

}


function removeFromCart(productId) {

    cart =
        cart.filter(
            item =>
                item.id !== productId
        );


    saveCart();

    updateCart();

    showToast(
        "Product removed from cart.",
        "success"
    );

}


function saveCart() {

    localStorage.setItem(
        "shopnova_cart",
        JSON.stringify(cart)
    );

}


/* =====================================================
   CART SUMMARY
===================================================== */

function calculateCart() {

    const subtotal =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    const discount =
        Math.min(
            couponDiscount,
            subtotal
        );


    const afterDiscount =
        subtotal - discount;


    const shipping =
        afterDiscount >= 1000
            ? 0
            : 79;


    const tax =
        afterDiscount * 0.05;


    const total =
        afterDiscount +
        shipping +
        tax;


    return {
        subtotal,
        discount,
        shipping,
        tax,
        total
    };

}


function updateCartSummary() {

    const totals =
        calculateCart();


    document.getElementById(
        "cart-subtotal"
    ).textContent =
        formatMoney(
            totals.subtotal
        );


    document.getElementById(
        "cart-discount"
    ).textContent =
        formatMoney(
            totals.discount
        );


    document.getElementById(
        "cart-shipping"
    ).textContent =
        totals.shipping === 0
            ? "FREE"
            : formatMoney(
                totals.shipping
            );


    document.getElementById(
        "cart-tax"
    ).textContent =
        formatMoney(
            totals.tax
        );


    document.getElementById(
        "cart-total"
    ).textContent =
        formatMoney(
            totals.total
        );

}


/* =====================================================
   COUPON
===================================================== */

function applyCoupon() {

    const input =
        document.getElementById(
            "coupon-input"
        );


    const code =
        input.value
            .trim()
            .toUpperCase();


    const subtotal =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    if (!code) {

        showToast(
            "Enter a coupon code.",
            "error"
        );

        return;

    }


    const coupons = {

        "SAVE10": 0.10,

        "SHOP20": 0.20,

        "WELCOME15": 0.15

    };


    if (!coupons[code]) {

        couponDiscount = 0;

        showToast(
            "Invalid coupon code.",
            "error"
        );

        updateCartSummary();

        return;

    }


    couponDiscount =
        subtotal *
        coupons[code];


    updateCartSummary();


    showToast(
        `${code} applied successfully!`,
        "success"
    );

}


/* =====================================================
   CART DRAWER
===================================================== */

function openCart() {

    document
        .getElementById(
            "cart-drawer"
        )
        .classList.add("open");


    document
        .getElementById(
            "cart-overlay"
        )
        .classList.add("show");


    document.body.style.overflow =
        "hidden";

}


function closeCart() {

    document
        .getElementById(
            "cart-drawer"
        )
        .classList.remove("open");


    document
        .getElementById(
            "cart-overlay"
        )
        .classList.remove("show");


    document.body.style.overflow =
        "";

}


/* =====================================================
   WISHLIST
===================================================== */

function toggleWishlist(productId) {

    const index =
        wishlist.indexOf(productId);


    if (index === -1) {

        wishlist.push(productId);

        showToast(
            "Added to wishlist ❤️",
            "success"
        );

    } else {

        wishlist.splice(index, 1);

        showToast(
            "Removed from wishlist.",
            "success"
        );

    }


    saveWishlist();

    updateWishlistCount();

    renderProducts();

}


function saveWishlist() {

    localStorage.setItem(
        "shopnova_wishlist",
        JSON.stringify(wishlist)
    );

}


function updateWishlistCount() {

    document.getElementById(
        "wishlist-count"
    ).textContent =
        wishlist.length;

}


function openWishlist() {

    renderWishlist();


    document.getElementById(
        "wishlist-modal"
    ).classList.add("show");

}


function closeWishlist() {

    document.getElementById(
        "wishlist-modal"
    ).classList.remove("show");

}


function renderWishlist() {

    const container =
        document.getElementById(
            "wishlist-items"
        );


    if (!wishlist.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ♡
                </div>

                <h3>
                    Your wishlist is empty
                </h3>

                <p>
                    Save products you love here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    wishlist.forEach(id => {

        const product =
            products.find(
                p => p.id === id
            );


        if (!product) {
            return;
        }


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "wishlist-item";


        item.innerHTML = `

            <img
                src="${product.image}"
                alt="${escapeHTML(
                    product.name
                )}"
            >


            <div class="wishlist-item-info">

                <h4>
                    ${escapeHTML(
                        product.name
                    )}
                </h4>

                <p>
                    ₹${formatMoney(
                        product.price
                    )}
                </p>


                <div
                    class="wishlist-item-actions"
                >

                    <button
                        onclick="addToCart(
                            ${product.id}
                        )"
                    >
                        Add to Cart
                    </button>

                    <button
                        onclick="toggleWishlist(
                            ${product.id}
                        ); renderWishlist()"
                    >
                        Remove
                    </button>

                </div>

            </div>

        `;


        container.appendChild(item);

    });

}


/* =====================================================
   PRODUCT MODAL
===================================================== */

function openProductModal(productId) {

    const product =
        products.find(
            p => p.id === productId
        );


    if (!product) {
        return;
    }


    const container =
        document.getElementById(
            "product-modal-content"
        );


    container.innerHTML = `

        <div class="modal-product-image">

            <img
                src="${product.image}"
                alt="${escapeHTML(
                    product.name
                )}"
            >

        </div>


        <div class="modal-product-details">

            <span class="section-label">
                ${escapeHTML(
                    product.category
                )}
            </span>


            <h2>
                ${escapeHTML(
                    product.name
                )}
            </h2>


            <div class="product-rating">

                <span class="stars">
                    ${createStars(
                        product.rating
                    )}
                </span>

                <span class="rating-count">
                    ${product.rating}
                    (${product.reviews} reviews)
                </span>

            </div>


            <p class="modal-description">
                ${escapeHTML(
                    product.description
                )}
            </p>


            <ul class="feature-list">

                ${
                    product.features
                        .map(
                            feature =>
                                `<li>
                                    ${escapeHTML(
                                        feature
                                    )}
                                </li>`
                        )
                        .join("")
                }

            </ul>


            <div class="modal-price">

                ₹${formatMoney(
                    product.price
                )}

                <span class="old-price">
                    ₹${formatMoney(
                        product.old_price
                    )}
                </span>

            </div>


            <button
                class="primary-btn"
                style="width:100%"
                onclick="
                    addToCart(${product.id});
                    closeProductModal();
                "
            >
                🛒 Add to Cart
            </button>

        </div>

    `;


    document.getElementById(
        "product-modal"
    ).classList.add("show");

}


function closeProductModal() {

    document.getElementById(
        "product-modal"
    ).classList.remove("show");

}


/* =====================================================
   CHECKOUT
===================================================== */

function openCheckout() {

    if (!cart.length) {

        showToast(
            "Your cart is empty.",
            "error"
        );

        return;

    }


    renderCheckout();


    closeCart();


    document.getElementById(
        "checkout-modal"
    ).classList.add("show");

}


function closeCheckout() {

    document.getElementById(
        "checkout-modal"
    ).classList.remove("show");

}


function renderCheckout() {

    const totals =
        calculateCart();


    const items =
        document.getElementById(
            "checkout-items"
        );


    items.innerHTML = "";


    cart.forEach(item => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "checkout-mini-item";


        div.innerHTML = `

            <span>
                ${escapeHTML(
                    item.name
                )}
                × ${item.quantity}
            </span>

            <strong>
                ₹${formatMoney(
                    item.price *
                    item.quantity
                )}
            </strong>

        `;


        items.appendChild(div);

    });


    document.getElementById(
        "checkout-subtotal"
    ).textContent =
        formatMoney(
            totals.subtotal
        );


    document.getElementById(
        "checkout-discount"
    ).textContent =
        formatMoney(
            totals.discount
        );


    document.getElementById(
        "checkout-shipping"
    ).textContent =
        totals.shipping === 0
            ? "FREE"
            : formatMoney(
                totals.shipping
            );


    document.getElementById(
        "checkout-tax"
    ).textContent =
        formatMoney(
            totals.tax
        );


    document.getElementById(
        "checkout-total"
    ).textContent =
        formatMoney(
            totals.total
        );

}


async function placeOrder(event) {

    event.preventDefault();


    if (!cart.length) {

        showToast(
            "Your cart is empty.",
            "error"
        );

        return;

    }


    const button =
        event.target.querySelector(
            'button[type="submit"]'
        );


    button.disabled = true;

    button.textContent =
        "Processing...";


    const payment =
        document.querySelector(
            'input[name="payment"]:checked'
        )?.value ||
        "Card";


    const customer = {

        name:
            document.getElementById(
                "customer-name"
            ).value,

        phone:
            document.getElementById(
                "customer-phone"
            ).value,

        email:
            document.getElementById(
                "customer-email"
            ).value,

        address:
            document.getElementById(
                "customer-address"
            ).value,

        city:
            document.getElementById(
                "customer-city"
            ).value,

        pincode:
            document.getElementById(
                "customer-pincode"
            ).value

    };


    try {

        const response =
            await fetch(
                "/api/order",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            customer,

                            cart,

                            discount:
                                couponDiscount,

                            payment_method:
                                payment

                        })

                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Order failed"
            );

        }


        document.getElementById(
            "order-id"
        ).textContent =
            data.order_id;


        document.getElementById(
            "checkout-modal"
        ).classList.remove(
            "show"
        );


        document.getElementById(
            "success-modal"
        ).classList.add(
            "show"
        );


        cart = [];

        couponDiscount = 0;

        saveCart();

        updateCart();


        event.target.reset();


    } catch (error) {

        showToast(
            error.message ||
            "Unable to place order.",
            "error"
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "🔒 Place Secure Order";

    }

}


function closeSuccess() {

    document.getElementById(
        "success-modal"
    ).classList.remove(
        "show"
    );


    scrollToProducts();

}


/* =====================================================
   LOGIN
===================================================== */

function openLogin() {

    document.getElementById(
        "login-modal"
    ).classList.add("show");

}


function closeLogin() {

    document.getElementById(
        "login-modal"
    ).classList.remove("show");

}


async function loginUser(event) {

    event.preventDefault();


    const email =
        document.getElementById(
            "login-email"
        ).value;


    const password =
        document.getElementById(
            "login-password"
        ).value;


    try {

        const response =
            await fetch(
                "/api/login",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email,
                            password
                        })

                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message
            );

        }


        localStorage.setItem(
            "shopnova_user",
            JSON.stringify(
                data.user
            )
        );


        closeLogin();


        showToast(
            `Welcome ${data.user.name}!`,
            "success"
        );


    } catch (error) {

        showToast(
            error.message ||
            "Login failed.",
            "error"
        );

    }

}


function demoLogin() {

    document.getElementById(
        "login-email"
    ).value =
        "demo@shopnova.com";


    document.getElementById(
        "login-password"
    ).value =
        "demo123";

}


/* =====================================================
   NEWSLETTER
===================================================== */

function subscribeNewsletter(event) {

    event.preventDefault();


    const email =
        document.getElementById(
            "newsletter-email"
        ).value;


    localStorage.setItem(
        "shopnova_newsletter",
        email
    );


    event.target.reset();


    showToast(
        "Subscribed! Your 10% discount is ready.",
        "success"
    );

}


/* =====================================================
   DARK MODE
===================================================== */

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );


    const enabled =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "shopnova_dark",
        enabled
    );

}


function loadDarkMode() {

    const enabled =
        localStorage.getItem(
            "shopnova_dark"
        ) === "true";


    if (enabled) {

        document.body.classList.add(
            "dark"
        );

    }

}


/* =====================================================
   MOBILE NAV
===================================================== */

function toggleMobileMenu() {

    document
        .getElementById(
            "main-navigation"
        )
        .classList.toggle(
            "show"
        );

}


/* =====================================================
   COUNTDOWN
===================================================== */

function startCountdown() {

    if (!saleEndTime) {

        saleEndTime =
            Date.now() +
            (
                2 * 24 * 60 * 60 * 1000
            ) +
            (
                12 * 60 * 60 * 1000
            );


        localStorage.setItem(
            "shopnova_sale_end",
            saleEndTime
        );

    }


    function updateTimer() {

        let distance =
            Number(saleEndTime) -
            Date.now();


        if (distance <= 0) {

            saleEndTime =
                Date.now() +
                3 * 24 *
                60 * 60 *
                1000;


            localStorage.setItem(
                "shopnova_sale_end",
                saleEndTime
            );


            distance =
                Number(saleEndTime) -
                Date.now();

        }


        const days =
            Math.floor(
                distance /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        const hours =
            Math.floor(
                (
                    distance %
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                ) /
                (
                    1000 *
                    60 *
                    60
                )
            );


        const minutes =
            Math.floor(
                (
                    distance %
                    (
                        1000 *
                        60 *
                        60
                    )
                ) /
                (
                    1000 *
                    60
                )
            );


        const seconds =
            Math.floor(
                (
                    distance %
                    (
                        1000 *
                        60
                    )
                ) /
                1000
            );


        document.getElementById(
            "timer-days"
        ).textContent =
            String(days).padStart(
                2,
                "0"
            );


        document.getElementById(
            "timer-hours"
        ).textContent =
            String(hours).padStart(
                2,
                "0"
            );


        document.getElementById(
            "timer-minutes"
        ).textContent =
            String(minutes).padStart(
                2,
                "0"
            );


        document.getElementById(
            "timer-seconds"
        ).textContent =
            String(seconds).padStart(
                2,
                "0"
            );

    }


    updateTimer();

    setInterval(
        updateTimer,
        1000
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

function scrollToProducts() {

    document
        .getElementById(
            "products"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


function goHome() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const icon =
        document.getElementById(
            "toast-icon"
        );


    const text =
        document.getElementById(
            "toast-message"
        );


    text.textContent =
        message;


    icon.textContent =
        type === "error"
            ? "!"
            : "✓";


    icon.style.background =
        type === "error"
            ? "var(--danger)"
            : "var(--success)";


    toast.classList.add(
        "show"
    );


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =====================================================
   HELPERS
===================================================== */

function formatMoney(value) {

    return Number(value)
        .toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

}


function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
===================================================== */

document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "show"
            );

        }

    }
);


/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        closeCart();

        closeProductModal();

        closeWishlist();

        closeLogin();

        closeCheckout();

    }
);