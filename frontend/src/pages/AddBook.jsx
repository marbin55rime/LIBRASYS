import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAdminInfo } from '../utils/localStorageUtils';
import Toast from '../components/Toast';
import '../styles/AddBook.css';

const AddBook = ({ showToast }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    publicationYear: '',
    isbn: '',
    category: '',
    language: '',
    totalCopies: '',
    description: '',
    tags: '',
  });
  const [coverImage, setCoverImage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const adminInfo = getAdminInfo();
    if (!adminInfo || !adminInfo.token) {
      showToast('Error: Not authorized as admin. Please log in.', 'error');
      navigate('/admin');
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (coverImage) {
      data.append('coverImage', coverImage);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      await axios.post('http://localhost:5000/api/books', data, config);
      showToast('Success: Book added successfully!', 'success');
      navigate('/admin/dashboard'); // Redirect to admin dashboard after adding book
    } catch (error) {
      showToast(`Error: ${error.response?.data?.message || 'Failed to add book'}`, 'error');
    }
  };

  return (
    <div className="add-book-container">
      <div className="add-book-overlay"></div>
      <div className="add-book-content">
        <div className="add-book-title-box">
          <div className="add-book-circle"></div>
          <h1>Add New Book</h1>
          <p>Fill in the details to add a new book to the system.</p>
        </div>
        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Title:</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Author:</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Genre:</label>
              <input type="text" name="genre" value={formData.genre} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Publication Year:</label>
              <input type="number" name="publicationYear" value={formData.publicationYear} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>ISBN:</label>
              <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Category:</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Language:</label>
              <input type="text" name="language" value={formData.language} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Total Copies:</label>
              <input type="number" name="totalCopies" value={formData.totalCopies} onChange={handleChange} required />
            </div>
            <div className="form-group full-width">
              <label>Description:</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>
            </div>
            <div className="form-group full-width">
              <label>Tags (comma-separated):</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} />
            </div>
            <div className="form-group full-width">
              <label>Cover Image:</label>
              <input type="file" name="coverImage" onChange={handleImageChange} />
            </div>
          </div>
          <button type="submit" className="submit-button">Add Book</button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
