const express = require('express');
const router = express.Router();
const { handleGenerateNewShortUrl } = require('../controllers/url');

router.get('/', (req, res) => {
  const shortId = req.query.id;
  res.render('home', { id: shortId });
});

router.post('/', handleGenerateNewShortUrl);

module.exports = router;
