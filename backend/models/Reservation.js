import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Book',
  },
  reservationDate: {
    type: Date,
    default: Date.now,
  },
  durationInWeeks: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  reservationStartDate: {
    type: Date,
  },
  reservationEndDate: {
    type: Date,
  },
  borrowExpiryDate: {
    type: Date,
  },
  fineExpiryDate: {
    type: Date,
  },
  fineAmount: {
    type: Number,
    default: 0,
  },
  returned: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'fulfilled', 'cancelled', 'expired'],
    default: 'pending',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Reservation = mongoose.model('Reservation', ReservationSchema);

export default Reservation;
