import React from 'react';
import '../styles/BookDetailsModal.css';
import { FaTimes } from 'react-icons/fa';

const BookDetailsModal = ({ book, onClose }) => {
  if (!book) return null;

  return (
    <div className="book-details-modal-overlay">
      <div className="book-details-modal-content">
        <button className="close-details-button" onClick={onClose}><FaTimes /></button>
        <div className="details-content-wrapper">
          <div className="details-image-container">
            {book.coverImage ? (
              <img src={`http://localhost:5000${book.coverImage}`} alt={book.title} className="details-cover-image" />
            ) : (
              <div className="details-cover-placeholder">No Image</div>
            )}
          </div>
          <div className="details-text-content">
            <h2>{book.title}</h2>
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>Genre:</strong> {book.genre}</p>
            <p><strong>Publication Year:</strong> {book.publicationYear}</p>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Category:</strong> {book.category}</p>
            <p><strong>Language:</strong> {book.language}</p>
            <p><strong>Total Copies:</strong> {book.totalCopies}</p>
            <p><strong>Available Copies:</strong> {book.availableCopies}</p>
            <p><strong>Description:</strong> {book.description}</p>
            <p><strong>Tags:</strong> {book.tags.join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
