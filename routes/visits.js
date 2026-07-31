const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');

// (a) POST /api/visits
// Writes a new visit record: timestamp, browser/device info, page, IP
router.post('/', async (req, res) => {
  try {
    const visit = new Visit({
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      page: req.body.page || '/'
    });

    await visit.save();

    res.status(201).json({
      message: 'Visit logged successfully',
      visit
    });
  } catch (err) {
    console.error('Error logging visit:', err);
    res.status(500).json({ error: 'Failed to log visit' });
  }
});

// (b) GET /api/visits/stats
// Returns aggregated data: total count + last N entries
router.get('/stats', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const totalVisits = await Visit.countDocuments();

    const recentVisits = await Visit.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('timestamp userAgent page -_id');

    res.status(200).json({
      totalVisits,
      recentVisits
    });
  } catch (err) {
    console.error('Error fetching visit stats:', err);
    res.status(500).json({ error: 'Failed to fetch visit stats' });
  }
});

module.exports = router;
