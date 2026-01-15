const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const customSelectWrapper = document.querySelector(".custom-select-wrapper");
const selectedOptionSpan = document.querySelector(".selected-option");
const options = document.querySelectorAll(".option");
const ratingToggle = document.querySelector(".rating-toggle");
const ratingOptions = document.querySelector(".rating-options");
const headerWishlistIcon = document.querySelector(".fa-heart");

const newProductIds = [1, 7, 9, 10, 16, 18, 22];

let allProducts = [];
let filteredProducts = [];
let currentRatingFilter = 0;
let wishlist = JSON.parse(localStorage.getItem("favorites")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderStars(rate) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        const fill = Math.max(0, Math.min(100, (rate - i + 1) * 100));
        html += `<span class="star" style="--fill:${fill}%">★</span>`;
    }
    return html;
}

function updateHeaderWishlistIcon() {
    headerWishlistIcon.style.color = "#777";
}

function toggleWishlist(id, icon) {
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(item => item !== id);
        icon.classList.remove("active");
        icon.classList.replace("fa-solid", "fa-regular");
    } else {
        wishlist.push(id);
        icon.classList.add("active");
        icon.classList.replace("fa-regular", "fa-solid");
    }
    localStorage.setItem("favorites", JSON.stringify(wishlist));
}

function renderProducts(products) {
    productGrid.innerHTML = "";
    if (!products.length) {
        productGrid.innerHTML = "<p style='font-size:20px;text-align:center;'>Product not found</p>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        const isNew = newProductIds.includes(product.id);
        const isFav = wishlist.includes(product.id);

        card.innerHTML = `
            ${isNew ? `<span class="badge-new">New</span>` : ""}
            <i class="fa-${isFav ? "solid" : "regular"} fa-heart wishlist-icon ${isFav ? "active" : ""}" data-id="${product.id}"></i>
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <div class="stars">${renderStars(product.rating.rate)}</div>
            <p>$${product.price}</p>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        `;

        productGrid.appendChild(card);
    });

    document.querySelectorAll(".wishlist-icon").forEach(icon => {
        const id = parseInt(icon.dataset.id);
        icon.addEventListener("click", e => {
            e.stopPropagation();
            toggleWishlist(id, icon);
        });
    });

    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            cart.push(id);
            localStorage.setItem("cart", JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated')); // добавлено для реального обновления счетчика
            alert("Product added to cart!");
        });
    });
}

async function loadProducts() {
    try {
        const res = await axios.get("https://fakestoreapi.com/products");
        allProducts = res.data;
        filteredProducts = [...allProducts];
        applyFiltersAndSort();
        updateHeaderWishlistIcon();
    } catch {
        productGrid.innerHTML = "<p>Failed to load products</p>";
    }
}

function filterProducts() {
    const query = searchInput.value.toLowerCase().trim();
    filteredProducts = query
        ? allProducts.filter(p => p.title.toLowerCase().includes(query))
        : [...allProducts];
    applyFiltersAndSort();
}

searchInput.addEventListener("input", filterProducts);
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") filterProducts(); });
searchBtn.addEventListener("click", filterProducts);

function applyFiltersAndSort() {
    const selectedSort = document.querySelector(".option.selected")?.dataset.value || "featured";
    let result = [...filteredProducts];

    switch (selectedSort) {
        case "a-z":
            result.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "z-a":
            result.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "low-high":
            result.sort((a, b) => a.price - b.price);
            break;
        case "high-low":
            result.sort((a, b) => b.price - a.price);
            break;
    }

    if (currentRatingFilter > 0) {
        result = result.filter(p => p.rating.rate >= currentRatingFilter);
        result.sort((a, b) => a.rating.rate - b.rating.rate);
    }

    renderProducts(result);
}

customSelectWrapper.addEventListener("click", e => {
    e.stopPropagation();
    customSelectWrapper.classList.toggle("open");
    const icon = customSelectWrapper.querySelector(".dropdown-icon");
    icon.classList.toggle("fa-angle-up");
    icon.classList.toggle("fa-angle-down");
    if (!customSelectWrapper.classList.contains("open")) ratingOptions.classList.remove("open");
});

options.forEach(option => {
    if (!option.classList.contains("rating-toggle")) {
        option.addEventListener("click", e => {
            e.stopPropagation();
            options.forEach(o => o.classList.remove("selected"));
            option.classList.add("selected");
            selectedOptionSpan.childNodes[0].textContent = option.textContent.trim();
            customSelectWrapper.classList.remove("open");
            ratingOptions.classList.remove("open");
            currentRatingFilter = 0;
            applyFiltersAndSort();
        });
    }
});

let ratingHoverTimeout;

ratingToggle.addEventListener("mouseenter", () => {
    clearTimeout(ratingHoverTimeout);
    ratingOptions.classList.add("open");
});

ratingToggle.addEventListener("mouseleave", () => {
    ratingHoverTimeout = setTimeout(() => {
        ratingOptions.classList.remove("open");
    }, 150);
});

ratingOptions.addEventListener("mouseenter", () => {
    clearTimeout(ratingHoverTimeout);
    ratingOptions.classList.add("open");
});

ratingOptions.addEventListener("mouseleave", () => {
    ratingOptions.classList.remove("open");
});

ratingToggle.addEventListener("click", e => {
    e.stopPropagation();
    ratingOptions.classList.toggle("open");
});

document.querySelectorAll(".rating-option").forEach(opt => {
    opt.addEventListener("click", e => {
        e.stopPropagation();
        document.querySelectorAll(".rating-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        currentRatingFilter = parseFloat(opt.dataset.rating);
        selectedOptionSpan.childNodes[0].textContent = opt.textContent;
        customSelectWrapper.classList.remove("open");
        ratingOptions.classList.remove("open");
        applyFiltersAndSort();
    });
});

document.addEventListener("click", e => {
    if (!customSelectWrapper.contains(e.target)) {
        customSelectWrapper.classList.remove("open");
        ratingOptions.classList.remove("open");
        const icon = customSelectWrapper.querySelector(".dropdown-icon");
        icon.classList.remove("fa-angle-up");
        icon.classList.add("fa-angle-down");
    }
});

function updateCartCount() {
    const cartCountElem = document.getElementById("cart-count");
    if (!cartCountElem) return;
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    cartCountElem.textContent = cartData.length;
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
});

window.addEventListener('cartUpdated', () => {
    updateCartCount();
});

const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
    const triggerPoint = header.offsetHeight / 2;
    header.classList.toggle("header-scrolled", window.scrollY > triggerPoint);
});

loadProducts();
