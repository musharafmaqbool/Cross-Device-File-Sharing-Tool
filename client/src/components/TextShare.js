import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TextShare = () => {
  const [text, setText] = useState('');
  const [slug, setSlug] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { slug: urlSlug } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If there's a slug in the URL, fetch the text
    if (urlSlug) {
      fetchText(urlSlug);
    }
  }, [urlSlug]);
  
  const fetchText = async (textSlug) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/text/${textSlug}`);
      setText(res.data.content);
      setSlug(textSlug);
      setLoading(false);
    } catch (err) {
      setError('Text not found or has expired');
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.post('/api/text', {
        content: text,
        slug: customSlug || undefined
      });
      
      setSlug(res.data.slug);
      setSuccess(true);
      
      // Update URL without reloading the page
      navigate(`/${res.data.slug}`, { replace: true });
      
      setLoading(false);
      
      // Copy link to clipboard
      const shareLink = `${window.location.origin}/${res.data.slug}`;
      navigator.clipboard.writeText(shareLink);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };
  
  const handleNewText = () => {
    setText('');
    setSlug('');
    setCustomSlug('');
    setError('');
    navigate('/');
  };
  
  return (
    <div className="text-share-container">
      <h1 className="text-share-title">Share Text</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Text saved! Link copied to clipboard.</div>}
      
      <form onSubmit={handleSubmit} className="text-share-form">
        <div className="form-group">
          <textarea
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            rows="10"
          />
        </div>
        
        <div className="form-group custom-url">
          <label htmlFor="customSlug">Custom URL (optional):</label>
          <div className="custom-url-input">
            <span className="url-prefix">{window.location.origin}/</span>
            <input
              type="text"
              id="customSlug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.replace(/\s+/g, '-'))}
              placeholder="my-custom-url"
              disabled={!!urlSlug}
            />
          </div>
        </div>
        
        <div className="button-group">
          {urlSlug ? (
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleNewText}
            >
              Create New Text
            </button>
          ) : (
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save & Share'}
            </button>
          )}
          
          {slug && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                const shareLink = `${window.location.origin}/${slug}`;
                navigator.clipboard.writeText(shareLink);
                setSuccess(true);
                setTimeout(() => {
                  setSuccess(false);
                }, 3000);
              }}
            >
              Copy Link
            </button>
          )}
        </div>
        
        {slug && (
          <div className="share-link">
            <p>Share this link:</p>
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
              {window.location.origin}/{slug}
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default TextShare;