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
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

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

// Small toast helper for instant feedback
function showToast(message) {
    let toast = document.getElementById('solareToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'solareToast';
        toast.style.position = 'fixed';
        toast.style.left = '50%';
        toast.style.bottom = '24px';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = 'rgba(0,0,0,0.85)';
        toast.style.color = '#fff';
        toast.style.padding = '10px 18px';
        toast.style.borderRadius = '8px';
        toast.style.zIndex = 2000;
        toast.style.fontSize = '14px';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2200);
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
        <div class="card-media" style="position:relative; overflow:hidden;">
            <img src="${product.image}" alt="${product.alt || product.name}" loading="lazy">
            <div class="overlay" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:8px; opacity:0; transition:opacity .18s ease; background:linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 100%);">
                <button class="btn-primary btn-small quick-view">View</button>
                <button class="btn-primary btn-small quick-add">Add</button>
            </div>
        </div>
        <h3>${product.name}</h3>
        <div class="price">$${product.price}</div>
    `;
    // hover overlay
    card.addEventListener('mouseenter', () => { const ov = card.querySelector('.overlay'); if (ov) ov.style.opacity = '1'; });
    card.addEventListener('mouseleave', () => { const ov = card.querySelector('.overlay'); if (ov) ov.style.opacity = '0'; });
    // quick actions
    card.querySelector('.quick-view').addEventListener('click', (e) => { e.stopPropagation();
        openModal(product.id); });
    card.querySelector('.quick-add').addEventListener('click', (e) => { e.stopPropagation();
        addToCart(product.id);
        showToast(`${product.name} добавлен в корзину`); });
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
    if (modal) modal.classList.add('show');
    // move focus to close button for accessibility
    const closeBtnEl = modal ? modal.querySelector('.close') : null;
    if (closeBtnEl) closeBtnEl.focus();
}

function closeModal() {
    if (modal) modal.classList.remove('show');
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
    // search
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    if (s) filtered = filtered.filter(p => p.shape === s);
    if (c) filtered = filtered.filter(p => p.color === c);
    // sort
    const sort = sortSelect ? sortSelect.value : '';
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
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
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    if (clearFilters) clearFilters.addEventListener('click', () => {
        if (shapeFilter) shapeFilter.value = '';
        if (colorFilter) colorFilter.value = '';
        applyFilters();
    });

    // close buttons (may be multiple if modal exists on both pages)
    closeBtn.forEach(btn => {
        btn.addEventListener('click', closeModal);
        btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') closeModal(); });
    });

    // add to cart
    if (modalAddBtn) modalAddBtn.addEventListener('click', () => {
        if (currentProduct) {
            addToCart(currentProduct.id);
            closeModal();
            showToast(`${currentProduct.name} добавлен в корзину`);
        }
    });

    // click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    // close on ESC
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
});

// expose helpers for testing in console
window.solare = { products, getCart, addToCart, updateCartCount };