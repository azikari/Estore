const grid = document.getElementById('grid');
const tabs = document.querySelectorAll('.tabs-left .tab');
const customSelectWrapper = document.querySelector('.custom-select-wrapper');
const selectedOptionSpan = document.querySelector('.selected-option');
const optionsContainer = document.querySelector('.options');
const options = document.querySelectorAll('.option');

function renderStars(rate) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        html += `<span class="star" style="--fill:${Math.max(0, Math.min(100, (rate - i + 1) * 100))}%">★</span>`;
    }
    return html;
}

const newProductIds = [1, 7, 9, 10, 16, 18, 22];

async function loadProducts(category, sort = 'all') {
    if (!grid) return;
    const currentHeight = grid.offsetHeight;
    grid.style.minHeight = currentHeight + 'px';
    grid.innerHTML = '';

    try {
        const response = await axios.get('https://fakestoreapi.com/products');
        let products = response.data.filter(item => item.category === category);

        if (sort === 'az') {
            products.sort((a, b) => a.title.localeCompare(b.title));
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            const isNew = newProductIds.includes(product.id);

            card.innerHTML = `
                ${isNew ? `<span class="badge-new">New</span>` : ``}
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <div class="stars">${renderStars(product.rating.rate)}</div>
                <p>$${product.price}</p>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = '<p>Failed to load products</p>';
    } finally {
        grid.style.minHeight = '';
    }
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const selectedSort = document.querySelector('.option.selected')?.dataset.value || 'all';
        loadProducts(tab.dataset.category, selectedSort);
    });
});

customSelectWrapper.addEventListener('click', () => {
    customSelectWrapper.classList.toggle('open');
    const icon = customSelectWrapper.querySelector('.dropdown-icon');
    if (customSelectWrapper.classList.contains('open')) {
        icon.classList.remove('fa-angle-down');
        icon.classList.add('fa-angle-up');
    } else {
        icon.classList.remove('fa-angle-up');
        icon.classList.add('fa-angle-down');
    }
});

options.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();

        options.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        selectedOptionSpan.childNodes[0].textContent = option.textContent;

        customSelectWrapper.classList.remove('open');

        const icon = customSelectWrapper.querySelector('.dropdown-icon');
        icon.classList.remove('fa-angle-up');
        icon.classList.add('fa-angle-down');

        const activeTab = document.querySelector('.tabs-left .tab.active');
        if (activeTab) loadProducts(activeTab.dataset.category, option.dataset.value);
    });
});

document.addEventListener('click', (e) => {
    if (!customSelectWrapper.contains(e.target)) {
        customSelectWrapper.classList.remove('open');

        const icon = customSelectWrapper.querySelector('.dropdown-icon');
        icon.classList.remove('fa-angle-up');
        icon.classList.add('fa-angle-down');
    }
});

loadProducts("men's clothing");