import Book from '../models/Book.js';
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

  // Check if book with same title or ISBN already exists
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
      category,
      language,
      totalCopies,
      availableCopies: totalCopies, // Initially, all copies are available
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
const getBooks = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const searchKeyword = req.query.search ? {
    $or: [
      { title: { $regex: req.query.search, $options: 'i' } },
      { author: { $regex: req.query.search, $options: 'i' } },
      { isbn: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { tags: { $regex: req.query.search, $options: 'i' } },
    ],
  } : {};

  const genreFilter = req.query.genre ? { genre: req.query.genre } : {};

  try {
    const count = await Book.countDocuments({ ...searchKeyword, ...genreFilter });
    const books = await Book.find({ ...searchKeyword, ...genreFilter })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      books,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching books: ${error.message}` });
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error fetching book: ${error.message}` });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private (Admin)
const updateBook = async (req, res) => {
  const { title, author, genre, publicationYear, isbn, category, language, totalCopies, availableCopies, description, tags } = req.body;

  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      // Check if title or ISBN is being changed and if the new value is already taken by another book
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
      book.category = category || book.category;
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

// @desc    Get books for public search with filters
// @route   GET /api/books/search
// @access  Public
const searchPublicBooks = asyncHandler(async (req, res) => {
  try {
    console.log('searchPublicBooks: Function entered.'); // New log to confirm entry
    console.log('searchPublicBooks: Received query params:', req.query);
    const pageSize = parseInt(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    let searchQuery = {};
    const queryString = req.query.query;
    if (queryString) {
      const searchRegex = { $regex: queryString, $options: 'i' };
      searchQuery = {
        $or: [
          { title: searchRegex },
          { author: searchRegex },
          { tags: searchRegex },
        ],
      };
    }

    const genreFilter = req.query.genre ? { genre: req.query.genre } : {};

    const availableOnlyFilter = req.query.availableOnly === 'true' ? { availableCopies: { $gt: 0 } } : {};
    
    const finalQuery = { ...searchQuery, ...genreFilter, ...availableOnlyFilter };
    console.log('searchPublicBooks: Final MongoDB Query:', finalQuery);

    const count = await Book.countDocuments(finalQuery);
    const books = await Book.find(finalQuery)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ books, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    console.error('CRITICAL ERROR in searchPublicBooks (caught by internal try-catch):', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

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


export { upload, getBooks, getBookById, updateBook, deleteBook, searchPublicBooks, getBookSuggestions, addBook };
