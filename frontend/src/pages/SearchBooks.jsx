import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SearchBooks.css';
import BookDetailsModal from '../components/BookDetailsModal';
import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';

const SearchBooks = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const limit = 5; // 5 books per page

  const fetchBooks = async (query = '', genre = '', available = false, pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      let url = `http://localhost:5000/api/books?page=${pageNumber}&limit=${limit}`;
      if (query || genre || available) {
        url = `http://localhost:5000/api/books/search?query=${query}&page=${pageNumber}&limit=${limit}`;
      }
      if (genre) {
        url += `&genre=${genre}`;
      }
      if (available) {
        url += `&availableOnly=true`;
      }
      console.log('Fetching books from URL:', url); // Log the URL
      const response = await axios.get(url);
      console.log('Books fetched successfully:', response.data); // Log successful response
      setBooks(response.data.books || []);
      setPages(response.data.pages || 1);
      setPage(pageNumber);

      const allGenres = [...new Set((response.data.books || []).map(book => book.genre))];
      setGenres(prevGenres => [...new Set([...prevGenres, ...allGenres])]);

    } catch (err) {
      console.error('Fetch books API error:', err.response ? err.response.data : err.message);
      setError('Failed to fetch books. Please try again.');
      toast.error('Failed to fetch books. Please try again.');
      console.error('Fetch books error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await axios.get(`http://localhost:5000/api/books/suggestions?keyword=${searchQuery}`);
          setSuggestions(response.data);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Error fetching suggestions:', err);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const debounceTimeout = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  useEffect(() => {
    fetchBooks(searchQuery, selectedGenre, availableOnly, page);
  }, [page, selectedGenre, searchQuery, availableOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks(searchQuery, selectedGenre, availableOnly, 1);
    setShowSuggestions(false);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setPage(1);
  };

  const handleAvailableOnlyChange = (e) => {
    setAvailableOnly(e.target.checked);
    setPage(1);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setPage(1);
    fetchBooks(suggestion, selectedGenre, availableOnly, 1);
  };

  const openModal = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (loading && books.length === 0) {
    return <div className="admin-user-details-container"><div className="admin-user-details-overlay"></div><div className="admin-user-details-content">Loading books...</div></div>;
  }

  if (error) {
    return <div className="admin-user-details-container"><div className="admin-user-details-overlay"></div><div className="admin-user-details-content error-message">{error}</div></div>;
  }

  return (
    <div className="admin-user-details-container">
      <div className="admin-user-details-overlay"></div>
      <div className="admin-user-details-content">
        <div className="admin-user-details-title-box">
          <div className="admin-user-details-circle"></div>
          <h1>Search Books</h1>
          <p>Find your next great read!</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by title, author, or tag"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              className="search-input"
            />
            <FaSearch className="search-icon" />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-dropdown">
                {suggestions.map((suggestion, index) => (
                  <li key={index} onMouseDown={() => handleSuggestionClick(suggestion)}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="search-button">Search</button>
        </form>

        <div className="filters-and-search">
          <select value={selectedGenre} onChange={handleGenreChange} className="genre-select">
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <label className="available-checkbox-label">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={handleAvailableOnlyChange}
              className="available-checkbox"
            />
            Available Only
          </label>
        </div>

        <div className="search-results">
          {books.length === 0 ? (
            !loading && !error && (searchQuery || selectedGenre || availableOnly ? <p>No books found for the current filters.</p> : <p>No books available.</p>)
          ) : (
            <div className="book-cards-grid">
              {books.map((book) => (
                <div key={book._id} className="book-card" onClick={() => openModal(book)}>
                  <h3 className="book-card-title">{book.title}</h3>
                  <div className="book-card-image-wrapper">
                    <div className="book-card-image-container">
                      {book.coverImage ? (
                        <img src={`http://localhost:5000${book.coverImage}`} alt={book.title} className="book-cover-image" />
                      ) : (
                        <div className="book-cover-placeholder">No Image</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="pagination-controls">
            {[...Array(pages).keys()].map((x) => (
              <button
                key={x + 1}
                onClick={() => handlePageChange(x + 1)}
                className={x + 1 === page ? 'active' : ''}
              >
                {x + 1}
              </button>
            ))}
          </div>
        )}

        {isModalOpen && selectedBook && (
          <BookDetailsModal book={selectedBook} onClose={closeModal} />
        )}
      </div>
    </div>
  );
};

export default SearchBooks;