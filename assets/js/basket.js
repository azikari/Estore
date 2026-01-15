const basketBody = document.getElementById("basket-body");
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let allProducts = [];

function renderStars(rate) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        const fill = Math.max(0, Math.min(100, (rate - i + 1) * 100));
        html += `<span class="star" style="--fill:${fill}%">★</span>`;
    }
    return html;
}

function renderBasket(products) {
    basketBody.innerHTML = "";

    if (!products.length) {
        basketBody.innerHTML = `
            <tr class="empty-basket">
                <td colspan="4">Your basket is empty</td>
            </tr>
        `;
        return;
    }

    const productCounts = {};
    cart.forEach(id => {
        productCounts[id] = (productCounts[id] || 0) + 1;
    });

    products.forEach(product => {
        const quantity = productCounts[product.id] || 0;
        const row = document.createElement("tr");
        row.className = "basket-row";

        row.innerHTML = `
            <td class="basket-product">
                <img src="${product.image}" alt="${product.title}">
                <div class="product-info">
                    <span>${product.title}</span>
                    <div class="stars">${renderStars(product.rating.rate)}</div>
                </div>
            </td>

            <td>
                <div class="basket-qty">
                    <button class="qty-decrease" data-id="${product.id}">-</button>
                    <span class="qty">${quantity}</span>
                    <button class="qty-increase" data-id="${product.id}">+</button>
                </div>
            </td>

            <td>
                <div class="basket-price">$${(product.price * quantity).toFixed(2)}</div>
            </td>

            <td>
                <div class="basket-remove">
                    <i class="fa-solid fa-xmark" data-id="${product.id}"></i>
                </div>
            </td>
        `;

        basketBody.appendChild(row);
    });
}

async function loadProducts() {
    try {
        const res = await axios.get("https://fakestoreapi.com/products");
        allProducts = res.data;
        updateBasket();
        calculateTotal();
    } catch {
        basketBody.innerHTML = `
            <tr class="empty-basket">
                <td colspan="4">Failed to load products</td>
            </tr>
        `;
    }
}

function updateBasket() {
    const uniqueIds = [...new Set(cart)];
    const cartProducts = uniqueIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean);
    renderBasket(cartProducts);
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateBasket();
    window.dispatchEvent(new Event('cartUpdated'));
}

basketBody.addEventListener("click", (e) => {
    const id = parseInt(e.target.dataset.id);
    if (!id) return;

    const row = e.target.closest(".basket-row");
    const qtyElem = row.querySelector(".qty");
    const priceElem = row.querySelector(".basket-price");
    const product = allProducts.find(p => p.id === id);

    if (e.target.classList.contains("qty-increase")) {
        cart.push(id);
    }

    if (e.target.classList.contains("qty-decrease") || e.target.classList.contains("fa-xmark")) {
        const index = cart.indexOf(id);
        if (index !== -1) {
            cart.splice(index, 1);
        }
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    const quantity = cart.filter(item => item === id).length;
    if (quantity === 0) {
        row.remove();
    } else {
        qtyElem.textContent = quantity;
        priceElem.textContent = `$${(product.price * quantity).toFixed(2)}`;
    }

    window.dispatchEvent(new Event('cartUpdated'));
});

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.getElementById("backBtn");
    const clearBasketBtn = document.getElementById("clearBasketBtn");

    backBtn.addEventListener("click", () => {
        window.location.href = "all.html";
    });

    clearBasketBtn.addEventListener("click", () => {
        Swal.fire({
            title: "Do you want to delete all items in the basket?",
            showDenyButton: true,
            confirmButtonText: "Yes",
            denyButtonText: "No"
        }).then((result) => {
            if (result.isConfirmed) {
                cart = [];
                localStorage.setItem("cart", JSON.stringify(cart));
                updateBasket();
                Swal.fire("Deleted!", "All items have been removed.", "success");
            } else if (result.isDenied) {
                Swal.fire("Cancelled", "Basket is not cleared", "info");
            }
        });
    });

    updateCartCount();
});

function updateCartCount() {
    const cartCountElem = document.getElementById("cart-count");
    if (!cartCountElem) return;
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    cartCountElem.textContent = cartData.length;
}

window.addEventListener('cartUpdated', () => {
    updateCartCount();
});

const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
    const triggerPoint = header.offsetHeight / 2;
    header.classList.toggle("header-scrolled", window.scrollY > triggerPoint);
});


const totalPrice = document.querySelector("#total-price");

function calculateTotal() {
    if (!allProducts.length) return;

    const productCounts = {};
    cart.forEach(id => {
        productCounts[id] = (productCounts[id] || 0) + 1;
    });

    let total = 0;
    for (const id in productCounts) {
        const product = allProducts.find(p => p.id === parseInt(id));
        if (product) {
            total += product.price * productCounts[id];
        }
    }

    if (totalPrice) totalPrice.textContent = `$${total.toFixed(2)}`;
}


window.addEventListener('cartUpdated', calculateTotal);
document.addEventListener('DOMContentLoaded', calculateTotal);


loadProducts();
