const express = require('express');
const router = express.Router();
const { createOrUpdateText, getText } = require('../controllers/textcontroller');

// POST /api/text - Create or update text
router.post('/', createOrUpdateText);

// GET /api/text/:slug - Get text by slug
router.get('/:slug', getText);

module.exports = router;