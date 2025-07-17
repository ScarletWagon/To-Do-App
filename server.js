// TaskMaster Node.js Express Server
// Serves static files and index.html for SPA routing

const express = require('express');
const path = require('path');
const app = express();

// Serve all static files in the project root
app.use(express.static(path.join(__dirname)));

// Always serve index.html for any route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});