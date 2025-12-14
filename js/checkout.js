/* checkout.js
   Simple checkout flow: shows order summary from cart, collects shipping info,
   simulates payment and clears cart on success.
*/

function readCart() {
    try { return JSON.parse(localStorage.getItem('solare_cart')) || []; } catch (e) { return []; }
}

function writeCart(cart) { localStorage.setItem('solare_cart', JSON.stringify(cart)); if (window.solare) window.solare.updateCartCount(); }

function formatMoney(n) { return `$${n.toFixed(2)}`; }

function renderCheckout() {
    const root = document.getElementById('checkoutRoot');
    const cart = readCart();
    if (!cart || cart.length === 0) {
        root.innerHTML = `<div class="checkout-panel"><p class="form-foot">Ваша корзина пуста. <a href="collection.html" class="btn-primary">Перейти в коллекцию</a></p></div>`;
        return;
    }

    let total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    root.innerHTML = `
        <div class="checkout-grid">
            <div class="checkout-panel">
                <h3>Shipping Information</h3>
                <form id="checkoutForm">
                    <div class="form-row"><div class="col"><label class="field-label">Full name</label><input id="shipName" required></div></div>
                    <div class="form-row"><div class="col"><label class="field-label">Address</label><input id="shipAddress" required></div></div>
                    <div class="form-row"><div class="col"><label class="field-label">City</label><input id="shipCity" required></div><div class="col"><label class="field-label">Postal code</label><input id="shipPostal" required></div></div>
                    <h3>Payment</h3>
                    <div class="card-mock"><div class="chip" aria-hidden="true"></div><div style="flex:1;"><div style="font-weight:600">Test card</div><div style="font-size:13px;color:#666">Введите тестовые данные</div></div></div>
                    <div style="margin-top:12px;"><label class="field-label">Cardholder name</label><input id="cardName" required></div>
                    <div class="form-row"><div class="col"><label class="field-label">Card number</label><input id="cardNumber" required placeholder="4242 4242 4242 4242"></div><div style="width:120px;"><label class="field-label">CVC</label><input id="cardCVC" required placeholder="CVC"></div></div>
                    <div style="margin-top:16px; display:flex; gap:12px; align-items:center;"><button id="payBtn" class="btn-primary btn-gold" type="submit">Pay ${formatMoney(total)}</button><div id="payMessage" style="color:#666;font-size:13px;"></div></div>
                </form>
            </div>
            <aside class="checkout-panel">
                <h3>Order Summary</h3>
                <div class="order-summary" id="orderItems"></div>
                <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;"><div class="summary-total">Total</div><div class="summary-total">${formatMoney(total)}</div></div>
            </aside>
        </div>
    `;

    // render items
    const orderItems = document.getElementById('orderItems');
    cart.forEach(i => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `<img src="${i.image}" alt="${i.name}"><div class="meta"><div class="name">${i.name}</div><div class="qty">Qty: ${i.qty} • ${formatMoney(i.price)}</div></div><div style="font-weight:700">${formatMoney(i.price * i.qty)}</div>`;
        orderItems.appendChild(div);
    });

    // submit handler: simulate payment and clear cart
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Basic validation
        const name = document.getElementById('shipName').value.trim();
        const address = document.getElementById('shipAddress').value.trim();
        if (!name || !address) {
            const msg = document.getElementById('payMessage');
            if (msg) msg.textContent = 'Please complete shipping details';
            return;
        }
        // Simulate payment delay
        const btn = document.getElementById('payBtn');
        btn.disabled = true;
        btn.textContent = 'Processing...';
        const msg = document.getElementById('payMessage');
        if (msg) msg.textContent = '';
        setTimeout(() => {
            // Save order to localStorage as demo
            const orders = JSON.parse(localStorage.getItem('solare_orders') || '[]');
            const orderId = Date.now();
            orders.push({ id: orderId, items: cart, total, shipping: { name: document.getElementById('shipName').value, address: document.getElementById('shipAddress').value }, date: new Date().toISOString() });
            localStorage.setItem('solare_orders', JSON.stringify(orders));
            localStorage.setItem('solare_last_order_id', String(orderId));
            // clear cart
            writeCart([]);
            // redirect to confirmation
            window.location.href = 'order-confirmation.html';
        }, 1100);
    });
}

document.addEventListener('DOMContentLoaded', renderCheckout);