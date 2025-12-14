/* cart.js
   Render cart contents from localStorage, allow quantity updates, removal and clearing the cart.
*/

function readCart() {
    try {
        return JSON.parse(localStorage.getItem('solare_cart')) || [];
    } catch (e) {
        return [];
    }
}

function writeCart(cart) {
    localStorage.setItem('solare_cart', JSON.stringify(cart));
    if (window.solare && typeof window.solare.updateCartCount === 'function') window.solare.updateCartCount();
}

function formatMoney(n) {
    return `$${n.toFixed(2)}`;
}

function renderCart() {
    const container = document.getElementById('cartContainer');
    const cart = readCart();
    container.innerHTML = '';
    if (!cart || cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <img src="assets/images/bags/bag1.jpg" alt="empty" style="max-width:240px; opacity:0.9; border-radius:8px;">
                <h3 style="margin-top:12px;">Your cart is empty</h3>
                <p style="color:#666;">Add items from our collection to get started.</p>
                <p style="margin-top:10px;"><a href="collection.html" class="btn-primary">Shop Collection</a></p>
            </div>
        `;
        return;
    }

    const list = document.createElement('div');
    list.className = 'cart-list';

    let total = 0;

    cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-row';
        const subtotal = item.price * item.qty;
        total += subtotal;

        row.innerHTML = `
            <div class="cart-thumb"><img src="${item.image}" alt="${item.name}" style="width:80px;height:auto;border-radius:6px;"></div>
            <div class="cart-info">
                <div style="font-weight:600;">${item.name}</div>
                <div style="color:#666; font-size:13px;">${formatMoney(item.price)}</div>
            </div>
            <div class="cart-qty">
                <button class="qty-decrease">−</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-increase">+</button>
            </div>
            <div class="cart-sub">${formatMoney(subtotal)}</div>
            <div><button class="btn-remove">Remove</button></div>
        `;

        // qty handlers
        row.querySelector('.qty-increase').addEventListener('click', () => {
            item.qty += 1;
            writeCart(cart);
            renderCart();
        });
        row.querySelector('.qty-decrease').addEventListener('click', () => {
            if (item.qty > 1) item.qty -= 1;
            else {
                // remove
                const idx = cart.findIndex(i => i.id === item.id);
                if (idx > -1) cart.splice(idx, 1);
            }
            writeCart(cart);
            renderCart();
        });

        row.querySelector('.btn-remove').addEventListener('click', () => {
            const idx = cart.findIndex(i => i.id === item.id);
            if (idx > -1) cart.splice(idx, 1);
            writeCart(cart);
            renderCart();
        });

        list.appendChild(row);
    });

    const summary = document.createElement('div');
    summary.className = 'cart-summary';
    summary.innerHTML = `
        <div style="font-weight:700; font-size:18px;">Total: ${formatMoney(total)}</div>
        <div style="margin-top:12px;"><button id="clearCart" class="btn-primary">Clear Cart</button> <button id="checkout" class="btn-primary btn-gold">Checkout</button></div>
    `;

    container.appendChild(list);
    container.appendChild(summary);

    document.getElementById('clearCart').addEventListener('click', () => {
        writeCart([]);
        renderCart();
    });

    document.getElementById('checkout').addEventListener('click', () => {
        // Redirect to real checkout page
        window.location.href = 'checkout.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});