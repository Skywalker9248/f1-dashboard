const express = require('express');
const cors = require('cors');
const f1Routes = require('./routes/f1Routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/f1', f1Routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
