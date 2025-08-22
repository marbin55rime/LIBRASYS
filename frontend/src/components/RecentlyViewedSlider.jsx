import React from 'react';
import '../styles/RecentlyViewedSlider.css'; // We'll create this CSS file

const RecentlyViewedSlider = ({ books }) => {
  return (
    <div className="recently-viewed-slider-container">
      <div className="recently-viewed-slider">
        {books.map((book) => (
          <div key={book._id} className="recently-viewed-slider-item">
            <img src={`http://localhost:5000${book.coverImage}`} alt={book.title} className="slider-book-image" />
            <p className="slider-book-title">{book.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedSlider;
