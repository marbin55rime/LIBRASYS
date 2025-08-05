import mongoose from 'mongoose';

const supportSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    userId: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
    },
    phoneNumber: {
      type: String,
    },
    issue: {
      type: String,
      required: [true, 'Please describe the issue'],
    },
    solution: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Resolved'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Support = mongoose.model('Support', supportSchema);

export default Support;
