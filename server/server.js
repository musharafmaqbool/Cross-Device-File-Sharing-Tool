const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// In-memory storage for demo (replace with database in production)
const textShares = {};
const fileShares = {};

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Cross-Device File Sharing Server is running!',
        endpoints: {
            'POST /api/text': 'Share text',
            'GET /api/text/:id': 'Get shared text',
            'POST /api/file': 'Upload file',
            'GET /api/file/:filename': 'Download file'
        }
    });
});

// Text sharing routes
app.post('/api/text', (req, res) => {
    try {
        const { text, customUrl } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text content is required' });
        }

        const id = customUrl || Date.now().toString();
        textShares[id] = {
            text: text,
            createdAt: new Date(),
            id: id
        };

        console.log(`Text shared with ID: ${id}`);
        res.json({ 
            success: true, 
            id: id,
            url: `http://localhost:3000/text/${id}`
        });
    } catch (error) {
        console.error('Error sharing text:', error);
        res.status(500).json({ error: 'Failed to share text' });
    }
});

app.get('/api/text/:id', (req, res) => {
    try {
        const { id } = req.params;
        const textData = textShares[id];
        
        if (!textData) {
            return res.status(404).json({ error: 'Text not found' });
        }

        console.log(`Text retrieved for ID: ${id}`);
        res.json(textData);
    } catch (error) {
        console.error('Error retrieving text:', error);
        res.status(500).json({ error: 'Failed to retrieve text' });
    }
});

// File sharing routes
app.post('/api/file', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { customUrl } = req.body;
        const fileId = customUrl || req.file.filename;
        
        fileShares[fileId] = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            createdAt: new Date(),
            id: fileId
        };

        console.log(`File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);
        res.json({ 
            success: true, 
            id: fileId,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            url: `http://localhost:3000/file/${fileId}`
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

app.get('/api/file/:id', (req, res) => {
    try {
        const { id } = req.params;
        const fileData = fileShares[id];
        
        if (!fileData) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filepath = path.join(__dirname, 'uploads', fileData.filename);
        
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        console.log(`File downloaded: ${fileData.originalName}`);
        res.download(filepath, fileData.originalName);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// Serve uploaded files statically (optional)
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to check server status`);
});