/* main.js
   Отвечает за: генерацию карточек, модальное окно, фильтры и корзину (localStorage)
*/

// --- DOM references ---
const previewGrid = document.getElementById("previewGrid");
const productsGrid = document.getElementById("productsGrid");
const modal = document.getElementById("productModal");
const modalMainImg = document.getElementById("modalMainImg");
const modalName = document.getElementById("modalName");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const modalShape = document.getElementById("modalShape");
const modalColor = document.getElementById("modalColor");
const modalAddBtn = document.getElementById("modalAddBtn");
const modalThumbs = document.getElementById('modalThumbs');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const miniCartBtn = document.getElementById('miniCartBtn');
const miniCartDropdown = document.getElementById('miniCartDropdown');
const miniCartItemsEl = document.querySelector('.mini-cart-items');
const miniCartTotalEl = document.querySelector('.mini-cart-total');
const closeBtn = document.querySelectorAll(".close");
const cartCountEls = document.querySelectorAll("#cartCount");

// Filters (on collection page)
const shapeFilter = document.getElementById("shapeFilter");
const colorFilter = document.getElementById("colorFilter");
const clearFilters = document.getElementById("clearFilters");
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

let currentProduct = null;
let modalIndex = 0;

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
        cart.push({ id: product.id, name: product.name, price: product.price, image: (product.images && product.images[0]) || product.image, qty: 1 });
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
    renderMiniCart();
}

// --- rendering ---
function createCard(product) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = product.id;
    card.innerHTML = `
            <div class="card-media" style="position:relative; overflow:hidden;">
            <img src="${(product.images && product.images[0]) || product.image}" alt="${product.alt || product.name}" loading="lazy">
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
    card.querySelector('.quick-view').addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(product.id);
    });
    card.querySelector('.quick-add').addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product.id);
        showToast(`${product.name} добавлен в корзину`);
    });
    // add details link
    const details = document.createElement('a');
    details.className = 'btn-primary btn-small';
    details.href = `product.html?id=${product.id}`;
    details.textContent = 'Details';
    details.addEventListener('click', (e) => { e.stopPropagation(); /* follow link */ });
    card.querySelector('.overlay').appendChild(details);
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
    // gallery setup
    const imgs = product.images && product.images.length ? product.images : [product.image];
    modalIndex = 0;
    if (modalMainImg) modalMainImg.src = imgs[modalIndex];
    if (modalThumbs) {
        modalThumbs.innerHTML = '';
        imgs.forEach((src, i) => {
            const t = document.createElement('img');
            t.src = src;
            t.className = 'gallery-thumb' + (i === modalIndex ? ' active' : '');
            t.loading = 'lazy';
            t.alt = product.name + ' view ' + (i + 1);
            t.addEventListener('click', () => { showSlide(i); });
            modalThumbs.appendChild(t);
        });
    }
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

function showSlide(index) {
    if (!currentProduct) return;
    const imgs = currentProduct.images && currentProduct.images.length ? currentProduct.images : [currentProduct.image];
    modalIndex = (index + imgs.length) % imgs.length;
    if (modalMainImg) modalMainImg.src = imgs[modalIndex];
    // update thumbs
    if (modalThumbs) {
        const thumbs = modalThumbs.querySelectorAll('.gallery-thumb');
        thumbs.forEach((t, i) => t.classList.toggle('active', i === modalIndex));
    }
}

function nextSlide() {
    if (!currentProduct) return;
    showSlide(modalIndex + 1);
}

function prevSlide() {
    if (!currentProduct) return;
    showSlide(modalIndex - 1);
}

function renderMiniCart() {
    if (!miniCartItemsEl) return;
    const cart = getCart();
    miniCartItemsEl.innerHTML = '';
    if (!cart.length) {
        miniCartItemsEl.innerHTML = '<div style="padding:12px;color:#666;">Корзина пуста</div>';
        if (miniCartTotalEl) miniCartTotalEl.textContent = 'Total: $0';
        return;
    }
    cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'mini-cart-item';
        row.innerHTML = `<img src="${item.image}" alt="${item.name}"><div style="flex:1;"><div style="font-weight:600">${item.name}</div><div style="font-size:13px;color:#666">Qty ${item.qty} • $${item.price}</div></div><button class="mini-remove" data-id="${item.id}" aria-label="Remove">×</button>`;
        miniCartItemsEl.appendChild(row);
    });
    const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
    if (miniCartTotalEl) miniCartTotalEl.textContent = `Total: $${total}`;
    // attach remove handlers
    miniCartItemsEl.querySelectorAll('.mini-remove').forEach(btn => btn.addEventListener('click', (e) => {
        const id = Number(btn.dataset.id);
        removeFromCart(id);
    }));
}

function removeFromCart(id) {
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    cart.splice(idx, 1);
    saveCart(cart);
    renderMiniCart();
    showToast('Товар удалён из корзины');
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

    // gallery arrows
    if (modalPrev) modalPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
    });
    if (modalNext) modalNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
    });

    // keyboard navigation for gallery when modal open
    window.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('show')) return;
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });

    // mini-cart toggle
    if (miniCartBtn && miniCartDropdown) miniCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = miniCartDropdown.classList.toggle('show');
        miniCartBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close mini-cart on outside click
    window.addEventListener('click', (e) => {
        if (miniCartDropdown && !miniCartDropdown.contains(e.target) && e.target !== miniCartBtn) {
            miniCartDropdown.classList.remove('show');
            if (miniCartBtn) miniCartBtn.setAttribute('aria-expanded', 'false');
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