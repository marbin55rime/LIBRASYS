import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './dbConnect.js';

dotenv.config({ debug: false });
const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Global request logger
app.use((req, res, next) => {
  next();
});

app.use('/uploads', express.static('uploads'));

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

app.get('/', (req, res) => {
  res.send('LibraSys Backend Running');
});

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/books', bookRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', reviewRoutes);
app.use('/api/reservations', reservationRoutes);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
