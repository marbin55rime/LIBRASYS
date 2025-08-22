import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js'; // Import the User model
import asyncHandler from '../utils/asyncHandler.js';
import multer from 'multer';
import path from 'path';

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/books'); // Directory to save book cover images
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// @desc    Add a new book
// @route   POST /api/books
// @access  Private (Admin)
const addBook = async (req, res) => {
  const { title, author, genre, publicationYear, isbn, category, language, totalCopies, description, tags } = req.body;

  // If category is provided but not a valid ObjectId, set it to null
  const finalCategory = (category && mongoose.Types.ObjectId.isValid(category)) ? category : null;

  const bookExists = await Book.findOne({ $or: [{ title }, { isbn }] });
  if (bookExists) {
    return res.status(400).json({ message: 'Book with this title or ISBN already exists.' });
  }

  const coverImage = req.file ? `/uploads/books/${req.file.filename}` : '';

  try {
    const book = await Book.create({
      title,
      author,
      genre,
      publicationYear,
      isbn,
      category: finalCategory,
      language,
      totalCopies,
      availableCopies: totalCopies,
      coverImage,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: `Error adding book: ${error.message}` });
  }
};

// @desc    Get all books with pagination, search, and genre filter
// @route   GET /api/books
// @access  Public
const getBooks = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const keyword = req.query.search
    ? {
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { author: { $regex: req.query.search, $options: 'i' } },
          { tags: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const genreFilter = req.query.genre ? { genre: req.query.genre } : {};
  const categoryFilter = req.query.category && mongoose.Types.ObjectId.isValid(req.query.category) ? { category: req.query.category } : {};
  const availableOnlyFilter =
    req.query.availableOnly === 'true' ? { availableCopies: { $gt: 0 } } : {};

  const query = {
    ...keyword,
    ...genreFilter,
    ...categoryFilter,
    ...availableOnlyFilter,
  };

  try {
    const count = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('category', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ books, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    console.error('Error in getBooks:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = asyncHandler(async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      // Track recently viewed books for authenticated users
      if (req.user) { // req.user is set by the protect middleware
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (user) {
          // Remove if already exists to move it to the front
          user.recentlyViewedBooks = user.recentlyViewedBooks.filter(
            (bookId) => bookId.toString() !== book._id.toString()
          );
          // Add to the front
          user.recentlyViewedBooks.unshift(book._id);
          // Limit to latest 10 books
          user.recentlyViewedBooks = user.recentlyViewedBooks.slice(0, 10);
          await user.save();
        }
      }
      res.status(200).json(book);
    } else {
      res.status(404);
      throw new Error('Book not found');
    }
  } catch (error) {
    console.error('getBookById: Error fetching book or updating recently viewed:', error);
    res.status(500).json({ message: `Error fetching book: ${error.message}` });
  }
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private (Admin)
const updateBook = async (req, res) => {
  const { title, author, genre, publicationYear, isbn, category, language, totalCopies, availableCopies, description, tags } = req.body;

  // If category is provided and not a valid ObjectId, set it to null
  const finalCategory = (category && mongoose.Types.ObjectId.isValid(category)) ? category : null;

  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      if (title && title !== book.title) {
        const titleExists = await Book.findOne({ title });
        if (titleExists) {
          return res.status(400).json({ message: 'Book with this title already exists.' });
        }
      }
      if (isbn && isbn !== book.isbn) {
        const isbnExists = await Book.findOne({ isbn });
        if (isbnExists) {
          return res.status(400).json({ message: 'Book with this ISBN already exists.' });
        }
      }

      book.title = title || book.title;
      book.author = author || book.author;
      book.genre = genre || book.genre;
      book.publicationYear = publicationYear || book.publicationYear;
      book.isbn = isbn || book.isbn;
      book.category = finalCategory; // Use finalCategory
      book.language = language || book.language;
      book.totalCopies = totalCopies !== undefined ? totalCopies : book.totalCopies;
      book.availableCopies = availableCopies !== undefined ? availableCopies : book.availableCopies;
      book.description = description || book.description;
      book.tags = tags ? tags.split(',').map(tag => tag.trim()) : book.tags;

      if (req.file) {
        book.coverImage = `/uploads/books/${req.file.filename}`;
      }

      const updatedBook = await book.save();
      res.status(200).json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error updating book: ${error.message}` });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private (Admin)
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      await book.deleteOne();
      res.status(200).json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error deleting book: ${error.message}` });
  }
};



// @desc    Get book title suggestions for search
// @route   GET /api/books/suggestions
// @access  Public
const getBookSuggestions = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.json([]);
  }

  const suggestions = await Book.find({
    $or: [
      { title: { $regex: `^${keyword}`, $options: 'i' } },
      { author: { $regex: `^${keyword}`, $options: 'i' } },
      { tags: { $regex: `^${keyword}`, $options: 'i' } }, // Include tags in suggestions
    ],
  }).limit(10).select('title author tags'); // Select title, author, and tags for suggestions

  // Format suggestions to include title, author, or tags
  const formattedSuggestions = suggestions.map(book => {
    if (book.title && book.author) {
      return `${book.title} by ${book.author}`;
    } else if (book.title) {
      return book.title;
    } else if (book.author) {
      return book.author;
    } else if (book.tags && book.tags.length > 0) {
      return `Tag: ${book.tags[0]}`; // Return the first tag as a suggestion
    }
    return '';
  }).filter(s => s !== '');

  res.json(formattedSuggestions);
});

// @desc    Reserve a book
// @route   POST /api/books/:id/reserve
// @access  Private (User)
const reserveBook = asyncHandler(async (req, res) => {
  const { id: bookId } = req.params;
  const { durationInWeeks } = req.body;

  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (book.availableCopies <= 0) {
    res.status(400);
    throw new Error('No available copies for reservation');
  }

  const existingReservation = await Reservation.findOne({
    user: req.user._id,
    book: bookId,
    status: 'pending',
  });

  if (existingReservation) {
    res.status(400);
    throw new Error('You already have a pending reservation for this book.');
  }

  const reservation = await Reservation.create({
    user: req.user._id,
    book: bookId,
    durationInWeeks,
    status: 'pending',
    isApproved: false,
  });

  book.availableCopies -= 1;
  try {
    await book.save({ validateBeforeSave: false }); // Skip validation for category
  } catch (bookSaveError) {
    console.error('Error saving book during reservation:', bookSaveError);
    res.status(500);
    throw new Error(`Failed to update book availability: ${bookSaveError.message}`);
  }

  res.status(201).json({
    message: 'Book reserved successfully. Awaiting admin approval.',
    reservation,
  });
});

// @desc    Get total number of books
// @route   GET /api/books/count
// @access  Private (Admin)
const getTotalBooks = asyncHandler(async (req, res) => {
  try {
    const count = await Book.countDocuments({});
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: `Error fetching book count: ${error.message}` });
  }
});

export {
  upload,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBookSuggestions,
  addBook,
  reserveBook,
  getTotalBooks,
};