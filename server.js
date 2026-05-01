// Production server for Render deployment
// Serves the Vite build from ./dist and handles SPA routing
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist/
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback — all unknown routes return index.html
// so React Router handles client-side navigation
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// MUST bind to 0.0.0.0 for Render to detect the open port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chess 3D server running on port ${PORT}`);
});
