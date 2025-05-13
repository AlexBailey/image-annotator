import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'vite';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

async function startServer() {
  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: process.cwd(),
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    }
  });

  // Serve static files from the dist directory
  app.use(express.static('dist'));

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  app.use('*', async (req, res) => {
    const url = req.originalUrl;

    try {
      // Read index.html
      let template = await vite.transformIndexHtml(url, '');
      
      // Send the rendered HTML back
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
}); 