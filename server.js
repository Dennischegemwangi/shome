// server.js - Basic Express server for Shome Meme App
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed'));
        }
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        res.json({
            success: true,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API endpoints
app.get('/api/memes', (req, res) => {
    // Return mock meme data
    const memes = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Meme ${i + 1}`,
        url: `https://picsum.photos/seed/meme${i}/600/400`,
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
    }));
    
    res.json({ memes });
});

app.get('/api/templates', (req, res) => {
    const templates = [
        { id: 1, name: 'Drake Format', url: 'https://i.imgflip.com/30b1gx.jpg' },
        { id: 2, name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
        { id: 3, name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
        { id: 4, name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
        { id: 5, name: 'Expanding Brain', url: 'https://i.imgflip.com/1jwhww.jpg' },
        { id: 6, name: 'Woman Yelling at Cat', url: 'https://i.imgflip.com/345v97.jpg' }
    ];
    
    res.json({ templates });
});

app.post('/api/save-meme', (req, res) => {
    // Save meme data (in production, save to database)
    const memeData = req.body;
    console.log('Saving meme:', memeData);
    
    res.json({
        success: true,
        message: 'Meme saved successfully',
        id: Date.now(),
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Shome Meme App server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
});