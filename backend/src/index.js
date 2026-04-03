import { Hono } from 'hono';
import { cors } from 'hono/cors';
import f1Routes from './routes/f1Routes.js';

const app = new Hono();

// Middleware
app.use(
  '*',
  cors({
    origin: ['https://*.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  })
);

// Health check
app.get('/', (c) => c.json({ status: 'ok', runtime: 'cloudflare-workers' }));

// Routes
app.route('/api/f1', f1Routes);

export default app;
