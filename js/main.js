/* main.js
   Отвечает за: генерацию карточек, модальное окно, фильтры и корзину (localStorage)
*/

// --- DOM references ---
const previewGrid = document.getElementById("previewGrid");
const productsGrid = document.getElementById("productsGrid");
const modal = document.getElementById("productModal");
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const modalShape = document.getElementById("modalShape");
const modalColor = document.getElementById("modalColor");
const modalAddBtn = document.getElementById("modalAddBtn");
const closeBtn = document.querySelectorAll(".close");
const cartCountEls = document.querySelectorAll("#cartCount");

// Filters (on collection page)
const shapeFilter = document.getElementById("shapeFilter");
const colorFilter = document.getElementById("colorFilter");
const clearFilters = document.getElementById("clearFilters");

let currentProduct = null;

// --- localStorage cart helpers ---
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('solare_cart')) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('solare_cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find(i => i.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
    }
    saveCart(cart);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s, i) => s + i.qty, 0);
    cartCountEls.forEach(el => el.textContent = count);
}

// --- rendering ---
function createCard(product) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = product.id;
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <span>$${product.price}</span>
    `;
    card.addEventListener('click', () => openModal(product.id));
    return card;
}

function renderPreview() {
    if (!previewGrid) return;
    previewGrid.innerHTML = '';
    products.slice(0, 3).forEach(p => previewGrid.appendChild(createCard(p)));
}

function renderProducts(list) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    if (list.length === 0) {
        productsGrid.innerHTML = '<p>Нет товаров, соответствующих фильтрам.</p>';
        return;
    }
    list.forEach(p => productsGrid.appendChild(createCard(p)));
}

// --- modal ---
function openModal(id) {
    const product = products.find(p => p.id === Number(id));
    if (!product) return;
    currentProduct = product;
    modalImg.src = product.image;
    modalName.textContent = product.name;
    modalDescription.textContent = product.description;
    modalPrice.textContent = `$${product.price}`;
    modalShape.textContent = product.shape;
    modalColor.textContent = product.color;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    currentProduct = null;
}

// --- filters ---
function populateFilters() {
    if (!shapeFilter || !colorFilter) return;
    const shapes = [...new Set(products.map(p => p.shape))].sort();
    const colors = [...new Set(products.map(p => p.color))].sort();
    shapes.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        shapeFilter.appendChild(opt);
    });
    colors.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        colorFilter.appendChild(opt);
    });
}

function applyFilters() {
    if (!productsGrid) return;
    const s = shapeFilter ? shapeFilter.value : '';
    const c = colorFilter ? colorFilter.value : '';
    let filtered = products.slice();
    if (s) filtered = filtered.filter(p => p.shape === s);
    if (c) filtered = filtered.filter(p => p.color === c);
    renderProducts(filtered);
}

// --- events ---
document.addEventListener('DOMContentLoaded', () => {
    // initial render
    renderPreview();
    renderProducts(products);
    populateFilters();
    updateCartCount();

    // filter listeners
    if (shapeFilter) shapeFilter.addEventListener('change', applyFilters);
    if (colorFilter) colorFilter.addEventListener('change', applyFilters);
    if (clearFilters) clearFilters.addEventListener('click', () => {
        if (shapeFilter) shapeFilter.value = '';
        if (colorFilter) colorFilter.value = '';
        applyFilters();
    });

    // close buttons (may be multiple if modal exists on both pages)
    closeBtn.forEach(btn => btn.addEventListener('click', closeModal));

    // add to cart
    if (modalAddBtn) modalAddBtn.addEventListener('click', () => {
        if (currentProduct) {
            addToCart(currentProduct.id);
            closeModal();
        }
    });

    // click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});

// expose helpers for testing in console
window.solare = { products, getCart, addToCart, updateCartCount };