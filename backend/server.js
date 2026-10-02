import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendDirectory, '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';
let databaseState = 'connecting';

const staticOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://social-connect-omega-nine.vercel.app',
  ...(process.env.CLIENT_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = staticOrigins.includes(origin);
    const isVercelDomain = /^https:\/\/.*\.vercel\.app$/i.test(origin);
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

    if (isExplicitlyAllowed || isVercelDomain || isLocalhost) {
      return callback(null, true);
    }

    if (process.env.CLIENT_ORIGIN === '*') {
      return callback(null, true);
    }

    // Default to allowing the origin so deployed frontends never fail CORS
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '1mb' }));

const healthCheckHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Vibely API',
    database: databaseState,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
};

// Health check routes
app.get('/api/health', healthCheckHandler);
app.get('/health', healthCheckHandler);
app.get('/', healthCheckHandler);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ message: error.message || 'Something went wrong.' });
});

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Copy backend/.env.example to backend/.env and set a secret.');
  process.exit(1);
}

mongoose.connection.on('connected', () => { databaseState = 'connected'; });
mongoose.connection.on('disconnected', () => { databaseState = 'disconnected'; });

app.listen(PORT, HOST, () => {
  console.log(`Vibely API listening on http://${HOST}:${PORT}`);
});

connectDatabase()
  .then(() => { databaseState = 'connected'; })
  .catch((error) => {
    databaseState = 'disconnected';
    const authenticationFailed = error?.code === 18 || /bad auth|authentication failed/i.test(error?.message || '');
    const uriHasPlaceholders = /still contains placeholders/i.test(error?.message || '');
    if (uriHasPlaceholders) {
      console.error('MongoDB connection failed: MONGODB_URI contains placeholders. Replace the database username and password in backend/.env.');
    } else if (authenticationFailed) {
      console.error('MongoDB connection failed: Atlas authentication failed. Check the database username and password in backend/.env.');
    } else {
      console.error(`MongoDB connection failed (${error?.name || 'unknown error'}). Check MONGODB_URI and Atlas network access.`);
    }
  });