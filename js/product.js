/* product.js
   Renders a product page using `?id=...` and handles gallery, variants and reviews.
*/
(function() {
    function q(selector, ctx = document) { return ctx.querySelector(selector); }

    function getIdFromQuery() {
        const p = new URLSearchParams(location.search);
        return Number(p.get('id')) || null;
    }

    function formatMoney(n) { return `$${n.toFixed(2)}`; }

    function renderProduct(product) {
        const root = document.getElementById('productRoot');
        if (!product) {
            root.innerHTML = '<div class="checkout-panel"><p>Товар не найден. <a href="collection.html" class="btn-primary">Перейти в коллекцию</a></p></div>';
            return;
        }

        // update meta/title
        document.title = `${product.name} — SOLARÉ`;
        const desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute('content', product.description || '');

        const imgs = product.images && product.images.length ? product.images : [product.image];

        root.innerHTML = `
            <div style="margin-bottom:12px;"><a href="collection.html" class="btn-primary">← Back to Collection</a></div>
            <div class="checkout-grid">
                <div class="checkout-panel">
                    <div style="display:flex; gap:18px; align-items:flex-start; flex-wrap:wrap;">
                        <div style="flex:1; min-width:260px;">
                            <div class="gallery" id="prodGallery">
                                <button class="gallery-arrow left" id="prodPrev" aria-label="Previous">&#10094;</button>
                                <div class="gallery-main"><img id="prodMainImg" src="${imgs[0]}" alt="${product.name}" style="width:100%; border-radius:8px;"></div>
                                <button class="gallery-arrow right" id="prodNext" aria-label="Next">&#10095;</button>
                                <div class="gallery-thumbs" id="prodThumbs"></div>
                            </div>
                        </div>
                        <div style="flex:1; min-width:260px; text-align:left;">
                            <h1 style="font-family: 'Playfair Display', serif; margin-bottom:6px;">${product.name}</h1>
                            <div style="font-weight:800; font-size:20px; margin-bottom:8px;">${formatMoney(product.price)}</div>
                            <div style="color:#666; margin-bottom:12px;">${product.description}</div>
                            <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px;"><label class="field-label">Color</label><select id="variantColor"></select><label class="field-label">Shape</label><select id="variantShape"></select></div>
                            <div style="display:flex; gap:8px; align-items:center;">
                                <input id="productQty" type="number" min="1" value="1" style="width:80px;padding:8px;border-radius:6px;border:1px solid var(--gray);">
                                <button id="addToCartBtn" class="btn-primary btn-gold">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:22px;">
                        <h3>Reviews</h3>
                        <div id="reviewsList" style="margin-bottom:12px;"></div>
                        <form id="reviewForm">
                            <div style="display:flex; gap:8px; margin-bottom:8px;"><input id="reviewName" placeholder="Your name" required style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--gray);"><select id="reviewRating" required style="width:120px;padding:8px;border-radius:6px;border:1px solid var(--gray);"><option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option></select></div>
                            <textarea id="reviewText" placeholder="Write your review" required style="width:100%;height:80px;padding:8px;border-radius:6px;border:1px solid var(--gray);"></textarea>
                            <div style="margin-top:8px;"><button class="btn-primary" type="submit">Submit Review</button></div>
                        </form>
                    </div>
                </div>
                <aside class="checkout-panel">
                    <h3>Recommendations</h3>
                    <div id="recommendations"></div>
                </aside>
            </div>
        `;

        // populate variants
        const colorSel = q('#variantColor');
        const shapeSel = q('#variantShape');
        [product.color].filter(Boolean).forEach(c => {
            const o = document.createElement('option');
            o.value = c;
            o.textContent = c;
            colorSel.appendChild(o);
        });
        [product.shape].filter(Boolean).forEach(s => {
            const o = document.createElement('option');
            o.value = s;
            o.textContent = s;
            shapeSel.appendChild(o);
        });

        // gallery thumbs
        const thumbs = q('#prodThumbs');
        imgs.forEach((src, i) => {
            const t = document.createElement('img');
            t.src = src;
            t.className = 'gallery-thumb' + (i === 0 ? ' active' : '');
            t.loading = 'lazy';
            t.alt = product.name + ' view ' + (i + 1);
            t.addEventListener('click', () => {
                q('#prodMainImg').src = src;
                thumbs.querySelectorAll('.gallery-thumb').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
            });
            thumbs.appendChild(t);
        });
        // arrows
        q('#prodPrev').addEventListener('click', () => { cycle(-1); });
        q('#prodNext').addEventListener('click', () => { cycle(1); });
        let gi = 0;

        function cycle(dir) {
            gi = (gi + dir + imgs.length) % imgs.length;
            q('#prodMainImg').src = imgs[gi];
            thumbs.querySelectorAll('.gallery-thumb').forEach((x, i) => x.classList.toggle('active', i === gi));
        }

        // add to cart
        q('#addToCartBtn').addEventListener('click', () => {
            const qty = Math.max(1, Number(q('#productQty').value) || 1);
            const cart = JSON.parse(localStorage.getItem('solare_cart') || '[]');
            const existing = cart.find(i => i.id === product.id);
            if (existing) existing.qty += qty;
            else cart.push({ id: product.id, name: product.name, price: product.price, image: imgs[0], qty });
            localStorage.setItem('solare_cart', JSON.stringify(cart));
            if (window.solare && window.solare.updateCartCount) window.solare.updateCartCount();
            alert('Добавлено в корзину');
        });

        // reviews
        function reviewKey() { return 'solare_reviews_' + product.id; }

        function loadReviews() { return JSON.parse(localStorage.getItem(reviewKey()) || '[]'); }

        function saveReviews(arr) { localStorage.setItem(reviewKey(), JSON.stringify(arr)); }

        function renderReviews() {
            const list = q('#reviewsList');
            list.innerHTML = '';
            const revs = loadReviews();
            if (!revs.length) { list.innerHTML = '<div style="color:#666">Нет отзывов — будь первым!</div>'; return; }
            revs.slice().reverse().forEach(r => {
                const div = document.createElement('div');
                div.style.borderTop = '1px solid #eee';
                div.style.padding = '8px 0';
                div.innerHTML = `<div style="font-weight:700">${r.name} <span style="font-weight:600;color:#c9a14a">${'★'.repeat(r.rating)}</span></div><div style="color:#333">${r.text}</div><div style="color:#999;font-size:12px;margin-top:6px">${new Date(r.date).toLocaleString()}</div>`;
                list.appendChild(div);
            });
        }
        renderReviews();
        q('#reviewForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = q('#reviewName').value.trim();
            const text = q('#reviewText').value.trim();
            const rating = Number(q('#reviewRating').value);
            if (!name || !text) return alert('Please fill all fields');
            const revs = loadReviews();
            revs.push({ name, text, rating, date: new Date().toISOString() });
            saveReviews(revs);
            renderReviews();
            q('#reviewForm').reset();
        });

        // recommendations: show up to 3 different products
        const rec = document.getElementById('recommendations');
        const others = products.filter(p => p.id !== product.id).slice(0, 3);
        others.forEach(o => {
            const el = document.createElement('div');
            el.style.marginBottom = '10px';
            el.innerHTML = `<a href="product.html?id=${o.id}" style="display:flex;gap:10px;align-items:center;text-decoration:none;color:inherit"><img src="${(o.images&&o.images[0])||o.image}" alt="${o.name}" style="width:64px;height:64px;object-fit:cover;border-radius:6px"><div><div style="font-weight:600">${o.name}</div><div style="color:#666; font-size:13px">$${o.price}</div></div></a>`;
            rec.appendChild(el);
        });
    }

    // inject product JSON-LD for SEO
    function injectJsonLd(product) {
        if (!product) return;
        const ld = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.images || [product.image],
            "description": product.description || '',
            "offers": { "@type": "Offer", "priceCurrency": "USD", "price": product.price }
        };
        let s = document.getElementById('prodJsonLd');
        if (!s) { s = document.createElement('script');
            s.id = 'prodJsonLd';
            s.type = 'application/ld+json';
            document.head.appendChild(s); }
        s.textContent = JSON.stringify(ld);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const id = getIdFromQuery();
        const product = products.find(p => p.id === id);
        renderProduct(product);
        injectJsonLd(product);
    });
})();