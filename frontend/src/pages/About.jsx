import React from 'react';
import '../styles/About.css';
import about2Image from '../assets/about2.png';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-overlay"></div>
      <div className="about-content">
        <div className="about-left-section">
          <div className="about-image-box">
            <img src={about2Image} alt="Sticky Notes" className="about-sticky-notes" />
          </div>
        </div>
        <div className="about-right-section">
          <h1>Welcome to LIBRASYS</h1>
          <p className="tagline">Your Modern Library Management Solution</p>
          <p>
            LIBRASYS is a comprehensive and intuitive library management system designed to streamline
            all aspects of library operations. From efficient book management to seamless user interactions,
            our platform empowers libraries to provide exceptional service and enhance the reading experience.
          </p>
          
          <div className="features-section">
            <h2>Key Features:</h2>
            <ul>
              <li><strong>User Management:</strong> Secure authentication, admin approval, OTP, and password reset.</li>
              <li><strong>Member Onboarding:</strong> Easy new member addition with validation.</li>
              <li><strong>Book Discovery:</strong> Powerful search, filters, and auto-suggestions.</li>
              <li><strong>Book Reservation:</strong> Advance reservations with availability checks.</li>
              <li><strong>Book Categories:</strong> Organize by genre with full CRUD for admins.</li>
              <li><strong>Rating & Reviews:</strong> User feedback, multiple reviews, and average ratings.</li>
              <li><strong>Borrowing History:</strong> Track viewed and borrowed books, recent activity display.</li>
              <li><strong>Due Dates & Fines:</strong> Overdue alerts, fine calculation, and dashboard display.</li>
              <li><strong>Borrow/Return:</strong> Efficient process with availability checks.</li>
              <li><strong>Inventory Management:</strong> Track copies, prevent overbooking, and low stock alerts.</li>
            </ul>
          </div>

          <blockquote className="subquote">
            "Empowering libraries and enriching readers, one book at a time."
          </blockquote>

          <div className="contact-info">
            <h2>Contact Us:</h2>
            <p>Have questions or want to learn more about LIBRASYS?</p>
            <p>Email: <a href="mailto:info@libradsys.com">info@libradsys.com</a></p>
            <p>Phone: +1 (123) 456-7890</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
