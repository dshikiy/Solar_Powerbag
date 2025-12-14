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
        root.innerHTML = '<p>Your cart is empty. <a href="collection.html" class="btn-primary">Go to Collection</a></p>';
        return;
    }

    let total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    root.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 360px; gap:24px;">
            <div>
                <h3>Shipping Information</h3>
                <form id="checkoutForm">
                    <label>Full name</label>
                    <input id="shipName" required style="width:100%; padding:8px; margin-bottom:8px;">
                    <label>Address</label>
                    <input id="shipAddress" required style="width:100%; padding:8px; margin-bottom:8px;">
                    <label>City</label>
                    <input id="shipCity" required style="width:100%; padding:8px; margin-bottom:8px;">
                    <label>Postal code</label>
                    <input id="shipPostal" required style="width:100%; padding:8px; margin-bottom:8px;">
                    <h3 style="margin-top:16px;">Payment</h3>
                    <label>Cardholder name</label>
                    <input id="cardName" required style="width:100%; padding:8px; margin-bottom:8px;">
                    <label>Card number</label>
                    <input id="cardNumber" required style="width:100%; padding:8px; margin-bottom:8px;">
                    <div style="display:flex; gap:8px;"><input id="cardExp" required placeholder="MM/YY" style="flex:1;padding:8px;"> <input id="cardCVC" required placeholder="CVC" style="width:100px;padding:8px;"></div>
                    <div style="margin-top:12px;"><button class="btn-primary" type="submit">Pay ${formatMoney(total)}</button></div>
                </form>
            </div>
            <div style="border-left:1px solid var(--gray); padding-left:18px;">
                <h3>Order Summary</h3>
                <div id="orderItems"></div>
                <div style="margin-top:12px; font-weight:700;">Total: ${formatMoney(total)}</div>
            </div>
        </div>
    `;

    // render items
    const orderItems = document.getElementById('orderItems');
    cart.forEach(i => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.marginBottom = '8px';
        div.innerHTML = `<div>${i.name} x${i.qty}</div><div>${formatMoney(i.price * i.qty)}</div>`;
        orderItems.appendChild(div);
    });

    // submit handler: simulate payment and clear cart
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Basic validation
        const name = document.getElementById('shipName').value.trim();
        if (!name) return alert('Please fill required fields');
        // Simulate payment delay
        const btn = form.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Processing...';
        setTimeout(() => {
            // Save order to localStorage as demo
            const orders = JSON.parse(localStorage.getItem('solare_orders') || '[]');
            const orderId = Date.now();
            orders.push({ id: orderId, items: cart, total, shipping: { name: document.getElementById('shipName').value }, date: new Date().toISOString() });
            localStorage.setItem('solare_orders', JSON.stringify(orders));
            localStorage.setItem('solare_last_order_id', String(orderId));
            // clear cart
            writeCart([]);
            // redirect to confirmation
            window.location.href = 'order-confirmation.html';
        }, 1200);
    });
}

document.addEventListener('DOMContentLoaded', renderCheckout);