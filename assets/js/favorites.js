const productGrid = document.getElementById("product-grid");
const newProductIds = [1, 7, 9, 10, 16, 18, 22];
let wishlist = JSON.parse(localStorage.getItem("favorites")) || [];

const backBtn = document.getElementById("backBtn");
const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");

backBtn.addEventListener("click", () => {
    window.location.href = "all.html";
});

clearFavoritesBtn.addEventListener("click", () => {
    Swal.fire({
        title: "Do you want to delete all the favorites?",
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: "No"
    }).then((result) => {
        if (result.isConfirmed) {
            wishlist = [];
            localStorage.setItem("favorites", JSON.stringify(wishlist));
            renderProducts([]);
            updateWishlistIcon();

            Swal.fire("Deleted!", "All favorites have been removed.", "success");
        } else if (result.isDenied) {
            Swal.fire("Cancelled", "Favorites are not deleted", "info");
        }
    });
});

function renderStars(rate) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        const fill = Math.max(0, Math.min(100, (rate - i + 1) * 100));
        html += `<span class="star" style="--fill:${fill}%">★</span>`;
    }
    return html;
}

function updateWishlistIcon() {
    const headerWishlistIcon = document.querySelector(".header a.circle i.fa-heart");
    headerWishlistIcon.style.color = wishlist.length ? "red" : "#777";
    headerWishlistIcon.classList.toggle("active", wishlist.length > 0);
}

async function loadFavorites() {
    if (!wishlist.length) {
        productGrid.innerHTML = "<p style='text-align:center;font-size:20px'>No favorites yet</p>";
        updateWishlistIcon();
        return;
    }
    try {
        const res = await axios.get("https://fakestoreapi.com/products");
        const products = res.data.filter(p => wishlist.includes(p.id));
        renderProducts(products);
    } catch {
        productGrid.innerHTML = "<p style='text-align:center;font-size:20px'>Failed to load favorites</p>";
    }
}

function renderProducts(products) {
    productGrid.innerHTML = "";
    if (!products.length) {
        productGrid.innerHTML = "<p style='font-size:20px;text-align:center;'>No favorites yet</p>";
        return;
    }
    products.forEach(product => {
        const isNew = newProductIds.includes(product.id);
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            ${isNew ? `<span class="badge-new">New</span>` : ""}
            <i class="fa-solid fa-heart wishlist-icon active" data-id="${product.id}"></i>
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <div class="stars">${renderStars(product.rating.rate)}</div>
            <p>$${product.price}</p>
        `;
        productGrid.appendChild(card);
    });

    document.querySelectorAll(".wishlist-icon").forEach(icon => {
        icon.addEventListener("click", e => {
            e.stopPropagation();
            const id = parseInt(icon.dataset.id);
            removeFromFavorites(id);
        });
    });
}

function removeFromFavorites(id) {
    wishlist = wishlist.filter(f => f !== id);
    localStorage.setItem("favorites", JSON.stringify(wishlist));
    loadFavorites();
}

const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
    const triggerPoint = header.offsetHeight / 2;
    header.classList.toggle("header-scrolled", window.scrollY > triggerPoint);
});

loadFavorites();
