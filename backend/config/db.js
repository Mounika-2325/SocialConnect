import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('MONGODB_URI is required in backend/.env.');
  if (uri.includes('<') || uri.includes('>')) {
    throw new Error('MONGODB_URI still contains placeholders. Replace the database username and password in backend/.env.');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected successfully.');
}