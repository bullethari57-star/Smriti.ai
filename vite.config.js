import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local and .env for local dev server
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite development plugin to handle /api/chat locally
function localApiPlugin() {
  return {
    name: 'local-api-handler',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/chat' || req.url?.startsWith('/api/chat?')) {
          try {
            // Dynamically import handler to capture updated env vars
            const { default: handler } = await import('./api/chat.js');

            // Collect request body
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const bodyRaw = Buffer.concat(chunks).toString('utf-8');
            let body = {};
            if (bodyRaw) {
              try {
                body = JSON.parse(bodyRaw);
              } catch {
                body = bodyRaw;
              }
            }

            // Mock Vercel response helper methods
            const mockRes = {
              statusCode: 200,
              headers: {},
              setHeader(key, val) {
                this.headers[key] = val;
                res.setHeader(key, val);
                return this;
              },
              status(code) {
                this.statusCode = code;
                res.statusCode = code;
                return this;
              },
              json(data) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = this.statusCode;
                res.end(JSON.stringify(data));
              },
              end(data) {
                res.statusCode = this.statusCode;
                res.end(data);
              }
            };

            const mockReq = {
              method: req.method,
              headers: req.headers,
              body,
              url: req.url,
            };

            await handler(mockReq, mockRes);
          } catch (err) {
            console.error('Local /api/chat error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Local API handler failure' }));
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    localApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
