import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ShareHub
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        
        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' || location.pathname.includes('text') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Text Share
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/file" 
              className={`nav-link ${location.pathname === '/file' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              File Share
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;