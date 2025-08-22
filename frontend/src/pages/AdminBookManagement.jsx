

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAdminInfo } from '../utils/localStorageUtils';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminBookManagement.css';
import { FaEdit, FaPlus, FaMinus, FaTrash , FaTimes } from 'react-icons/fa';
import BookDetailsModal from '../components/BookDetailsModal';

const AdminBookManagement = ({ showToast }) => {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState(null); 
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]); 
  const [categories, setCategories] = useState([]); // New state for categories
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(''); // New state for category filter
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    fetchCategories(); // Fetch categories on component mount
  }, [page, keyword, genre, selectedCategoryFilter]); 

  const fetchCategories = async () => {
    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      navigate('/admin');
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/categories', config);
      setCategories(data);
    } catch (error) {
      showToast(`Error fetching categories: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  }; 

  const fetchBooks = async () => {
    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      navigate('/admin');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:5000/api/books?page=${page}&search=${keyword}&genre=${genre}&category=${selectedCategoryFilter}`, config);
      setBooks(data.books || []); 
      setPages(data.pages || 1);

      
      const allGenres = [...new Set((data.books || []).map(book => book.genre))];
      setGenres(allGenres);

    } catch (error) {
      showToast(`Error fetching books: ${error.response?.data?.message || 'Server error'}`, 'error');
      if (error.response && error.response.status === 401) {
        navigate('/admin');
      }
    }
  };

  const handleSearchChange = (e) => {
    setKeyword(e.target.value);
    setPage(1); 
  };

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
    setPage(1); 
  };

  const handleCategoryFilterChange = (e) => {
    setSelectedCategoryFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleViewDetails = (book) => {
    setSelectedBookForDetails(book);
  };

  const handleCloseDetails = () => {
    setSelectedBookForDetails(null);
  };

  const handleEditClick = (book) => {
    setEditingBook({ ...book, tags: book.tags.join(', '), category: book.category ? book.category._id : '' });
  };

  const handleEditChange = (e) => {
    setEditingBook({ ...editingBook, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      navigate('/admin');
      return;
    }

    const data = new FormData();
    for (const key in editingBook) {
      if (key === 'tags') {
        data.append(key, editingBook[key]);
      } else if (key === 'coverImage' && typeof editingBook[key] !== 'string') {
        data.append(key, editingBook[key]);
      } else if (key !== '__v' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') { 
        data.append(key, editingBook[key]);
      }
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      await axios.put(`http://localhost:5000/api/books/${editingBook._id}`, data, config);
      showToast('Success: Book updated successfully!', 'success');
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      showToast(`Error: ${error.response?.data?.message || 'Failed to update book'}`, 'error');
    }
  };

  const handleImageChange = (e) => {
    setEditingBook({ ...editingBook, coverImage: e.target.files[0] });
  };

  const handleAvailabilityChange = async (bookId, changeType) => {
    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      navigate('/admin');
      return;
    }

    try {
      const bookToUpdate = books.find(b => b._id === bookId);
      let newAvailableCopies = bookToUpdate.availableCopies;

      if (changeType === 'increase') {
        newAvailableCopies = Math.min(bookToUpdate.totalCopies, newAvailableCopies + 1);
      } else if (changeType === 'decrease') {
        newAvailableCopies = Math.max(0, newAvailableCopies - 1);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      await axios.put(`http://localhost:5000/api/books/${bookId}`, { availableCopies: newAvailableCopies }, config);
      showToast('Success: Availability updated!', 'success');
      fetchBooks(); 
    } catch (error) {
      showToast(`Error: ${error.response?.data?.message || 'Failed to update availability'}`, 'error');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      navigate('/admin');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      await axios.delete(`http://localhost:5000/api/books/${bookId}`, config);
      showToast('Success: Book deleted successfully!', 'success');
      fetchBooks(); 
    } catch (error) {
      showToast(`Error: ${error.response?.data?.message || 'Failed to delete book'}`, 'error');
    }
  };

  return (
    <div className="admin-book-management-container">
      <div className="admin-book-management-overlay"></div>
      <div className="admin-book-management-content">
        <div className="admin-book-management-title-box">
          <div className="admin-book-management-circle"></div>
          <h1>  Manage Books</h1>
          <p>View, edit, and manage all books in the library.</p>
        </div>

        <div className="filters-and-search">
          <input
            type="text"
            placeholder="Search books..."
            value={keyword}
            onChange={handleSearchChange}
            className="search-input"
          />
          <select value={genre} onChange={handleGenreChange} className="genre-select">
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
        </div>

        {books.length === 0 ? (
          <p className="no-books">No books found. Add some books to get started!</p>
        ) : (
          <>
            <div className="book-cards-grid">
              {books.map((book) => (
                <div key={book._id} className="book-card">
                <h3 className="book-card-title">{book.title}</h3>
                <div className="book-card-image-wrapper" onClick={() => handleViewDetails(book)}>
                  <div className="book-card-image-container">
                    {book.coverImage ? (
                      <img src={`http://localhost:5000${book.coverImage}`} alt={book.title} className="book-cover-image" />
                    ) : (
                      <div className="book-cover-placeholder">No Image</div>
                    )}
                  </div>
                </div>
                <div className="book-card-actions-bottom">
                  <button onClick={() => handleEditClick(book)} className="edit-button"><FaEdit /></button>
                  <div className="availability-controls-compact">
                    <button onClick={() => handleAvailabilityChange(book._id, 'decrease')} className="minus-button"><FaMinus /></button>
                    <span>{book.availableCopies}</span>
                    <button onClick={() => handleAvailabilityChange(book._id, 'increase')} className="plus-button"><FaPlus /></button>
                  </div>
                  <button onClick={() => handleDeleteBook(book._id)} className="delete-button"><FaTrash /></button>
                </div>
              </div>
              ))}
            </div>
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
          </>
        )}

        {selectedBookForDetails && (
          <BookDetailsModal book={selectedBookForDetails} onClose={handleCloseDetails} isAdminView={true} />
        )}

        {editingBook && (
          <div className="edit-book-modal-overlay">
            <div className="edit-book-modal-content">
              <h2>Edit Book Details</h2>
              <form onSubmit={handleSaveEdit} className="edit-book-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Title:</label>
                    <input type="text" name="title" value={editingBook.title} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>Author:</label>
                    <input type="text" name="author" value={editingBook.author} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>Genre:</label>
                    <input type="text" name="genre" value={editingBook.genre} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>Publication Year:</label>
                    <input type="number" name="publicationYear" value={editingBook.publicationYear} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>ISBN:</label>
                    <input type="text" name="isbn" value={editingBook.isbn} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <select name="category" value={editingBook.category} onChange={handleEditChange} required>
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language:</label>
                    <input type="text" name="language" value={editingBook.language} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>Total Copies:</label>
                    <input type="number" name="totalCopies" value={editingBook.totalCopies} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>Available Copies:</label>
                    <input type="number" name="availableCopies" value={editingBook.availableCopies} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Description:</label>
                    <textarea name="description" value={editingBook.description} onChange={handleEditChange} required></textarea>
                  </div>
                  <div className="form-group full-width">
                    <label>Tags (comma-separated):</label>
                    <input type="text" name="tags" value={editingBook.tags} onChange={handleEditChange} />
                  </div>
                  <div className="form-group full-width">
                    <label>Cover Image:</label>
                    <input type="file" name="coverImage" onChange={handleImageChange} />
                    {editingBook.coverImage && typeof editingBook.coverImage === 'string' && (
                      <img src={`http://localhost:5000${editingBook.coverImage}`} alt="Current Cover" className="current-cover-preview" />
                    )}
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-button">Save Changes</button>
                  <button type="button" onClick={() => setEditingBook(null)} className="cancel-button">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookManagement;
