import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  publicationYear: { type: Number, required: true },
  isbn: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false, default: null },
  language: { type: String, required: true },
  totalCopies: { type: Number, required: true, min: 0 },
  availableCopies: { type: Number, required: true, min: 0 },
  coverImage: { type: String, default: '' },
  description: { type: String, required: true },
  tags: [{ type: String }],
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
}, { timestamps: true });

// Ensure availableCopies doesn't exceed totalCopies
BookSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('totalCopies')) {
    if (this.availableCopies > this.totalCopies) {
      this.availableCopies = this.totalCopies;
    }
  }
  next();
});

const Book = mongoose.model('Book', BookSchema);

export default Book;
