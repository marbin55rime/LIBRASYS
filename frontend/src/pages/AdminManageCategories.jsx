import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAdminInfo } from '../utils/localStorageUtils';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminManageCategories.css'; // We'll create this CSS file
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminManageCategories = ({ showToast }) => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

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
      if (error.response && error.response.status === 401) {
        navigate('/admin');
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
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
      await axios.post('http://localhost:5000/api/categories', { name: newCategoryName }, config);
      showToast('Success: Category added successfully!', 'success');
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      showToast(`Error adding category: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
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
      await axios.put(`http://localhost:5000/api/categories/${editingCategory._id}`, { name: editingCategory.name }, config);
      showToast('Success: Category updated successfully!', 'success');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      showToast(`Error updating category: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
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
      await axios.delete(`http://localhost:5000/api/categories/${categoryId}`, config);
      showToast('Success: Category deleted successfully!', 'success');
      fetchCategories();
    } catch (error) {
      showToast(`Error deleting category: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  };

  return (
    <div className="admin-manage-categories-container">
      <div className="admin-manage-categories-overlay"></div>
      <div className="admin-manage-categories-content">
        <div className="admin-manage-categories-title-box">
          <h1>Manage Book Categories</h1>
          <p>Add, edit, and delete categories for organizing books.</p>
        </div>

        <div className="category-form-section">
          <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
          <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="category-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Category Name"
                value={editingCategory ? editingCategory.name : newCategoryName}
                onChange={(e) => editingCategory ? setEditingCategory({ ...editingCategory, name: e.target.value }) : setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-button">
              {editingCategory ? <><FaEdit /> Update Category</> : <><FaPlus /> Add Category</>}
            </button>
            {editingCategory && (
              <button type="button" onClick={() => setEditingCategory(null)} className="cancel-button">
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="categories-list-section">
          <h2>Existing Categories</h2>
          {categories.length === 0 ? (
            <p className="no-categories">No categories found. Add some above!</p>
          ) : (
            <ul className="categories-list">
              {categories.map((category) => (
                <li key={category._id} className="category-item">
                  <span>{category.name}</span>
                  <div className="category-actions">
                    <button onClick={() => setEditingCategory({ ...category })} className="action-button edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteCategory(category._id)} className="action-button delete">
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageCategories;
