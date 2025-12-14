const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

function readDB() {
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return { orders: [], messages: [] };
    }
}

function writeDB(obj) {
    fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/orders', (req, res) => {
    const db = readDB();
    res.json(db.orders || []);
});

app.post('/api/orders', (req, res) => {
    const db = readDB();
    const order = req.body;
    if (!order || !order.items || !order.items.length) return res.status(400).json({ error: 'Invalid order' });
    const id = Date.now();
    order.id = id;
    order.date = new Date().toISOString();
    db.orders.push(order);
    writeDB(db);
    res.status(201).json({ id });
});

app.get('/api/messages', (req, res) => {
    const db = readDB();
    res.json(db.messages || []);
});

app.post('/api/messages', (req, res) => {
    const db = readDB();
    const msg = req.body;
    if (!msg || !msg.name || !msg.email || !msg.message) return res.status(400).json({ error: 'Invalid message' });
    msg.date = new Date().toISOString();
    db.messages.push(msg);
    writeDB(db);
    res.status(201).json({ ok: true });
});

const port = process.env.PORT || 9876;
app.listen(port, () => console.log(`Mock API running on http://localhost:${port}`));