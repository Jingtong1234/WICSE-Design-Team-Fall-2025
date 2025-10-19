const express = require('express');
const multer = require('multer');

const router = express.Router();

// 8 MB limit for uploaded images
const upload = multer({
  limits: { fileSize: 8 * 1024 * 1024 },
});

// Quick sanity endpoint
router.get('/', (_req, res) => {
  res.json({ ok: true, message: 'Receipts endpoint' });
});

// POST /api/receipts/scan-url  { "imageUrl": "https://..." }
router.post('/scan-url', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

    const response = await fetch('https://api.veryfi.com/api/v8/partner/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': process.env.VERYFI_CLIENT_ID,
        'Authorization': `apikey ${process.env.VERYFI_USERNAME}:${process.env.VERYFI_API_KEY}`,
      },
      body: JSON.stringify({
        file_url: imageUrl,
        categories: ['Receipts'],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Veryfi error:', response.status, data);
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to scan receipt (url)' });
  }
});

// POST /api/receipts/scan   form-data: receipt=<file>
router.post('/scan', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'receipt file is required' });

    const base64 = req.file.buffer.toString('base64');

    const response = await fetch('https://api.veryfi.com/api/v8/partner/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': process.env.VERYFI_CLIENT_ID,
        'Authorization': `apikey ${process.env.VERYFI_USERNAME}:${process.env.VERYFI_API_KEY}`,
      },
      body: JSON.stringify({
        file_name: req.file.originalname || 'receipt.jpg',
        file_data: base64,
        categories: ['Receipts'],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Veryfi error:', response.status, data);
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to scan receipt (file)' });
  }
});

module.exports = router;

