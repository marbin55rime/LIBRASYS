import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './dbConnect.js';

dotenv.config({ debug: false });
const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

app.get('/', (req, res) => {
  res.send('LibraSys Backend Running');
});

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/books', bookRoutes);
app.use('/api/support', supportRoutes);

app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
