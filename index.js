const express = require('express');
const path = require('path');
const urlRoute = require('./routes/url');
const URL = require('./models/url');
const staticRoute = require('./routes/staticRouter');
const { connectToMongoDB } = require('./connect');

const app = express();
const PORT = 8001;

// Set up view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB connection
connectToMongoDB('mongodb://localhost:27017/short-url')
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection failed', err);
    process.exit(1);
  });

// Routes
app.use('/url', urlRoute); // URL shortening routes
app.use('/', staticRoute); // Static routes

// Redirect short URLs to original URLs
app.get('/:shortId', async (req, res) => {
  const shortId = req.params.shortId;

  try {
    const entry = await URL.findOneAndUpdate(
      { shortId: shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true } // Return the updated document
    );

    if (entry) {
      res.redirect(entry.redirectURL);
    } else {
      res.status(404).send('Short URL not found');
    }
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Server error');
  }
});

module.exports = app; // Export the app for testing or further usage
