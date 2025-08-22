import React from 'react';
import { FaStar } from 'react-icons/fa';
import '../styles/StarRating.css'; // We'll create this CSS file

const StarRating = ({ rating, onRatingChange }) => {
  const stars = [...Array(5)].map((_, index) => {
    const currentRating = index + 1;
    return (
      <label key={index}>
        <input
          type="radio"
          name="rating"
          value={currentRating}
          onClick={() => onRatingChange(currentRating)}
          style={{ display: 'none' }} // Hide default radio button
        />
        <FaStar
          className="star"
          color={currentRating <= rating ? "#ffc107" : "#e4e5e9"}
          size={30}
        />
      </label>
    );
  });

  return <div className="star-rating">{stars}</div>;
};

export default StarRating;
