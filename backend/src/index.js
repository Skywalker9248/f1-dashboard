import { Hono } from 'hono';
import { cors } from 'hono/cors';
import f1Routes from './routes/f1Routes.js';

const app = new Hono();

// Middleware
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowed = [
        'http://localhost:5173',
        'http://localhost:3000',
      ];
      // Allow any Vercel preview/production deployment
      if (origin && (origin.endsWith('.vercel.app') || allowed.includes(origin))) {
        return origin;
      }
      return null;
    },
  })
);

// Health check
app.get('/', (c) => c.json({ status: 'ok', runtime: 'cloudflare-workers' }));

// Routes
app.route('/api/f1', f1Routes);

export default app;
