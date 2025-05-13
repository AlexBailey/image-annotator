import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'vite';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (isProduction) {
    // In production, serve static files from the dist directory
    app.use(express.static(join(__dirname, 'dist')));
    
    // Handle all routes by serving index.html
    app.get('*', (req, res) => {
      res.sendFile(join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In development, use Vite's dev server
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      root: process.cwd()
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, '');
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
}); 