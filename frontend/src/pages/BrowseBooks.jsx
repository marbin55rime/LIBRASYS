import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BrowseBooks.css'; // Renamed CSS file
import BookDetailsModal from '../components/BookDetailsModal';
import { toast } from 'react-toastify';
import { FaSearch, FaStar } from 'react-icons/fa';
import { getUserInfo } from '../utils/userLocalStorageUtils'; // Import getUserInfo

const BrowseBooks = ({ showToast }) => { // Renamed component
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
  const [categories, setCategories] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const limit = 5;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showToast(`Error fetching categories: ${error.response?.data?.message || 'Server error'}`, 'error');
      }
    };
    fetchCategories();
  }, []);

  const fetchBooks = async (query = '', genre = '', available = false, pageNumber = 1, category = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = `http://localhost:5000/api/books?page=${pageNumber}&limit=${limit}`;
      if (query) {
        url += `&search=${query}`;
      }
      if (genre) {
        url += `&genre=${genre}`;
      }
      if (available) {
        url += `&availableOnly=true`;
      }
      if (category && category !== '') {
        url += `&category=${category}`;
      }
      const response = await axios.get(url);
      setBooks(response.data.books || []);
      setPages(response.data.pages || 1);
      setPage(pageNumber);

      const allGenres = [...new Set((response.data.books || []).map(book => book.genre))];
      setGenres(prevGenres => [...new Set([...prevGenres, ...allGenres])]);

    } catch (err) {
      setError('Failed to fetch books. Please try again.');
      toast.error('Failed to fetch books. Please try again.');
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
    fetchBooks('', selectedGenre, availableOnly, page, selectedCategoryFilter);
  }, [page, selectedGenre, availableOnly, selectedCategoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks(searchQuery, selectedGenre, availableOnly, 1, selectedCategoryFilter);
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

  const handleCategoryFilterChange = (e) => {
    const value = e.target.value;
    // Only set the filter if it's empty or a valid 24-character hex string (ObjectId)
    if (value === '' || /^[0-9a-fA-F]{24}$/.test(value)) {
      setSelectedCategoryFilter(value);
      setPage(1);
    } else {
      // Optionally, show a toast or log an error if an invalid value is somehow selected
      console.warn('Attempted to set invalid category filter:', value);
      showToast('Invalid category selected.', 'error');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setPage(1);
    fetchBooks(suggestion, selectedGenre, availableOnly, 1, selectedCategoryFilter);
  };

  const openModal = async (book) => {
    console.log('openModal: Function entered.');
    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.token) {
      showToast('Error: Please log in to view book details.', 'error');
      console.log('openModal: User not logged in.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      console.log(`openModal: Making API call to /api/books/${book._id} with token.`);
      const { data } = await axios.get(`http://localhost:5000/api/books/${book._id}`, config);
      console.log('openModal: Book details fetched successfully:', data);
      setSelectedBook(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('openModal: Error fetching book details:', error.response?.data || error.message);
      showToast(`Error fetching book details: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
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
          <h1>Browse Books</h1> {/* Changed title */}
          <p>Find and reserve your next great read!</p> {/* Changed description */}
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-and-button">
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
          </div>
        </form>

        <div className="filters-and-search">
          <select value={selectedGenre} onChange={handleGenreChange} className="genre-select">
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select value={selectedCategoryFilter} onChange={handleCategoryFilterChange} className="category-select">
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
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
                <div key={book._id} className="book-card">
                  <h3 className="book-card-title">{book.title}</h3>
                  <div className="book-card-image-wrapper" onClick={() => openModal(book)}>
                    <div className="book-card-image-container">
                      {book.coverImage ? (
                        <img src={`http://localhost:5000${book.coverImage}`} alt={book.title} className="book-cover-image" />
                      ) : (
                        <div className="book-cover-placeholder">No Image</div>
                      )}
                    </div>
                  </div>
                  <div className="book-card-actions-bottom">
                    <div className="book-card-rating">
                      {book.averageRating ? book.averageRating.toFixed(1) : 'N/A'} <FaStar className="star-icon" /> ({book.numReviews})
                    </div>
                    <div onClick={() => openModal(book)} className="view-details-button">View Details</div>
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
          <BookDetailsModal book={selectedBook} onClose={closeModal} showToast={showToast} />
        )}
      </div>
    </div>
  );
};

export default BrowseBooks;