import express from 'express';
import dotenv from 'dotenv';
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

export default app;
