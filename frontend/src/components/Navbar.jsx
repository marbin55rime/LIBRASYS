import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import logo from '../assets/logo.png';
import { FaHome, FaInfoCircle, FaLifeRing } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar">
      <Link to="/admin" className="navbar-left">
        <img src={logo} alt="LibraSys Logo" className="navbar-logo" />
        <span className="navbar-title">LibraSys</span>
      </Link>
      <div className="navbar-center">
        <ul className="navbar-links">
          <li><a href="/"><FaHome /> Home</a></li>
          <li><a href="/about"><FaInfoCircle /> About</a></li>
          <li><a href="/support"><FaLifeRing /> Support</a></li>
        </ul>
        <div className="live-time">{time.toLocaleTimeString()}</div>
      </div>
      <div className="navbar-right"></div>
    </nav>
  );
};

export default Navbar;
