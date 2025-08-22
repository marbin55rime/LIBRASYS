import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AdminApproval from './pages/AdminApproval';
import AdminUserDetails from './pages/AdminUserDetails';
import UserDashboard from './pages/UserDashboard';
import Toast from './components/Toast';
import AddBook from './pages/AddBook';
import AdminBookManagement from './pages/AdminBookManagement';
import BrowseBooks from './pages/BrowseBooks';
import About from './pages/About';
import Support from './pages/Support';
import AdminSupport from './pages/AdminSupport';
import AdminManageReservations from './pages/AdminManageReservations';
import AdminManageCategories from './pages/AdminManageCategories';
import AdminManageReviews from './pages/AdminManageReviews';
import ViewReviews from './pages/ViewReviews';
import WriteReview from './pages/WriteReview';
import MyReservations from './pages/MyReservations';
import RecentlyViewedBooksPage from './pages/RecentlyViewedBooksPage';


function App() {
  const [toast, setToast] = useState(null);

  console.log('App: userInfo from localStorage', localStorage.getItem('userInfo'));

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const clearToast = () => {
    setToast(null);
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home showToast={showToast} />} />
          <Route path="/register" element={<Register showToast={showToast} />} />
          <Route path="/admin" element={<Admin showToast={showToast} />} />
          <Route path="/admin/dashboard" element={<AdminDashboard showToast={showToast} />} />
          <Route path="/admin/approval" element={<AdminApproval showToast={showToast} />} />
          <Route path="/admin/users" element={<AdminUserDetails showToast={showToast} />} />
          <Route path="/admin/add-book" element={<AddBook showToast={showToast} />} />
          <Route path="/admin/manage-books" element={<AdminBookManagement showToast={showToast} />} />
          <Route path="/user/dashboard" element={<UserDashboard showToast={showToast} />} />
          <Route path="/my-reservations" element={<MyReservations showToast={showToast} />} />
          <Route path="/write-review" element={<WriteReview showToast={showToast} />} />
          <Route path="/view-reviews" element={<ViewReviews showToast={showToast} />} />
          <Route path="/browse-books" element={<BrowseBooks showToast={showToast} />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/admin/manage-reservations" element={<AdminManageReservations showToast={showToast} />} />
          <Route path="/admin/manage-categories" element={<AdminManageCategories showToast={showToast} />} />
          <Route path="/admin/manage-reviews" element={<AdminManageReviews showToast={showToast} />} />
          <Route path="/recently-viewed" element={<RecentlyViewedBooksPage showToast={showToast} />} />
        </Routes>

        {toast && (
          <div className="toast-container">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={clearToast}
            />
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;