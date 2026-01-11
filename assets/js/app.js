document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function () {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    });
});

const productGrid = document.getElementById('product-grid');

async function loadMensClothing() {
    try {
        const response = await axios.get("https://fakestoreapi.com/products");
        const products = response.data.filter(item => (item.category === 'jewelery')).slice(0, 3);

        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            card.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>$${product.price}</p>
            `;

            productGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = '<p>Failed to load products. Please try again later.</p>';
    }
}

loadMensClothing();

const latestGrid = document.getElementById('latest-grid');
const tabs = document.querySelectorAll('.tab');

function renderStars(rate) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        html += `<span class="star" style="--fill:${Math.max(0, Math.min(100, (rate - i + 1) * 100))}%">★</span>`;
    }
    return html;
}

const newProductIds = [1, 7, 9, 10, 16, 18, 22];

async function loadLatestProducts(category) {
    if (!latestGrid) return;

    const currentHeight = latestGrid.offsetHeight;
    latestGrid.style.minHeight = currentHeight + 'px';
    latestGrid.innerHTML = '';

    try {
        const response = await axios.get('https://fakestoreapi.com/products');
        const products = response.data
            .filter(item => item.category === category)
            .slice(0, 6);

        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            const isNew = newProductIds.includes(product.id);

            card.innerHTML = `
                ${isNew ? `<span class="badge-new">New</span>` : ``}
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <div class="stars">
                    ${renderStars(product.rating.rate)}
                </div>
                <p>$${product.price}</p>
            `;

            latestGrid.appendChild(card);
        });
    } catch (error) {
        latestGrid.innerHTML = '<p>Failed to load products</p>';
    } finally {
        latestGrid.style.minHeight = '';
    }
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loadLatestProducts(tab.dataset.category);
    });
});

loadLatestProducts("men's clothing");

// const header = document.querySelector('.header');

// window.addEventListener('scroll', () => {
//     if (window.scrollY > 50) {
//         header.classList.add('header-scrolled');
//     } else {
//         header.classList.remove('header-scrolled');
//     }
// });
