/* admin.js
   Simple admin UI to view and delete orders and messages stored in localStorage (demo only).
*/

function renderOrders() {
    const el = document.getElementById('adminOrders');
    const orders = JSON.parse(localStorage.getItem('solare_orders') || '[]');
    if (!orders.length) { el.innerHTML = '<p>No orders yet.</p>'; return; }
    el.innerHTML = '';
    orders.slice().reverse().forEach(order => {
        const wrap = document.createElement('div');
        wrap.style.borderBottom = '1px solid #eee';
        wrap.style.padding = '10px 0';
        wrap.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><div><strong>Order #${order.id}</strong><div style="color:#666; font-size:13px;">${new Date(order.date).toLocaleString()}</div></div><div><button class="btn-primary btn-small">Delete</button></div></div>`;
        wrap.querySelector('button').addEventListener('click', () => {
            const all = JSON.parse(localStorage.getItem('solare_orders') || '[]');
            const idx = all.findIndex(o => o.id === order.id);
            if (idx > -1) { all.splice(idx, 1);
                localStorage.setItem('solare_orders', JSON.stringify(all));
                renderOrders(); }
        });
        const items = document.createElement('div');
        items.style.marginTop = '8px';
        items.innerHTML = order.items.map(i => `<div style="display:flex; justify-content:space-between; color:#444;">${i.name} x${i.qty}<div>$${(i.price*i.qty).toFixed(2)}</div></div>`).join('');
        wrap.appendChild(items);
        el.appendChild(wrap);
    });
}

function renderMessages() {
    const el = document.getElementById('adminMessages');
    const messages = JSON.parse(localStorage.getItem('solare_messages') || '[]');
    if (!messages.length) { el.innerHTML = '<p>No messages yet.</p>'; return; }
    el.innerHTML = '';
    messages.slice().reverse().forEach((m, idx) => {
        const row = document.createElement('div');
        row.style.borderBottom = '1px solid #eee';
        row.style.padding = '10px 0';
        row.innerHTML = `<div style="display:flex; justify-content:space-between;"><div><strong>${m.name}</strong> <div style="color:#666; font-size:13px;">${m.email} • ${new Date(m.date).toLocaleString()}</div><div style="margin-top:8px;color:#333;">${m.message}</div></div><div><button class="btn-primary btn-small">Delete</button></div></div>`;
        row.querySelector('button').addEventListener('click', () => {
            const all = JSON.parse(localStorage.getItem('solare_messages') || '[]');
            const i = all.findIndex(x => x.date === m.date && x.email === m.email);
            if (i > -1) { all.splice(i, 1);
                localStorage.setItem('solare_messages', JSON.stringify(all));
                renderMessages(); }
        });
        el.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderOrders();
    renderMessages();
});