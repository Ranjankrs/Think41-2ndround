const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());

const datasetPath = './ecommerce-dataset/archive/archive/';

// Top 5 most sold products
app.get('/top-products', (req, res) => {
    const productCount = {};
    fs.createReadStream(`${datasetPath}order_items.csv`)
        .pipe(csv())
        .on('data', (row) => {
            const productId = row.product_id;
            const qty = parseInt(row.quantity);
            if (!productCount[productId]) productCount[productId] = 0;
            productCount[productId] += qty;
        })
        .on('end', () => {
            const top5 = Object.entries(productCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([product_id, quantity]) => ({ product_id, quantity }));
            res.json(top5);
        });
});

// Order status by ID
app.get('/order-status/:id', (req, res) => {
    const orderId = req.params.id;
    let found = false;

    fs.createReadStream(`${datasetPath}orders.csv`)
        .pipe(csv())
        .on('data', (row) => {
            if (row.order_id === orderId) {
                found = true;
                res.json({ order_id: row.order_id, status: row.status });
            }
        })
        .on('end', () => {
            if (!found) res.status(404).json({ error: 'Order not found' });
        });
});

// Stock availability by product name
app.get('/stock/:name', (req, res) => {
    const productName = req.params.name.toLowerCase();
    let found = false;

    fs.createReadStream(`${datasetPath}products.csv`)
        .pipe(csv())
        .on('data', (row) => {
            if (row.name.toLowerCase().includes(productName)) {
                found = true;
                res.json({ name: row.name, stock: row.stock_quantity });
            }
        })
        .on('end', () => {
            if (!found) res.status(404).json({ error: 'Product not found' });
        });
});

app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
});
