import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import TextShare from './components/TextShare';
import FileShare from './components/FileShare';
import Footer from './components/Footer';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<TextShare />} />
            <Route path="/file" element={<FileShare />} />
            <Route path="/:slug" element={<TextShare />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;