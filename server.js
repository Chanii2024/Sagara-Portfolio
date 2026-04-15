const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Image = require('./models/Image');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve all static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/sagara_portfolio')
    .then(() => console.log('MongoDB Connected: sagara_portfolio'))
    .catch(err => console.error('MongoDB Error:', err));

// Multer Storage (Memory for processing)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Routes ---

// 1. Login (Simple Auth)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'sagara' && password === '123') {
        res.json({ success: true, token: 'admin-token-secret' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// 2. Upload Image
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) throw new Error('No file uploaded');

        const { title, category, description } = req.body;
        const filename = `sagara-${Date.now()}.webp`;
        const filepath = path.join(uploadDir, filename);

        // Convert to WebP using Sharp
        await sharp(req.file.buffer)
            .webp({ quality: 80 })
            .toFile(filepath);

        // Save to DB
        const newImage = new Image({
            title,
            category,
            description,
            imageUrl: `uploads/${filename}`
        });

        await newImage.save();

        res.json({ success: true, image: newImage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Get Images
app.get('/api/images', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category && category !== 'All') {
            query.category = category;
        }
        const images = await Image.find(query).sort({ createdAt: -1 });
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
