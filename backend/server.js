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
const port = Number(process.env.PORT) || 5000;
let databaseState = 'connecting';

const allowedOrigins = [...new Set([
  'http://localhost:5173',
  'https://social-connect-omega-nine.vercel.app',
  ...(process.env.CLIENT_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean),
])];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Vibely API', database: databaseState }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong.' });
});

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Copy backend/.env.example to backend/.env and set a secret.');
  process.exit(1);
}

mongoose.connection.on('connected', () => { databaseState = 'connected'; });
mongoose.connection.on('disconnected', () => { databaseState = 'disconnected'; });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
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