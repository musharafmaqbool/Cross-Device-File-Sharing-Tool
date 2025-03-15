import React, { useState, useRef } from 'react';
import axios from 'axios';

const FileShare = () => {
  const [file, setFile] = useState(null);
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size exceeds 100MB limit');
        setFile(null);
        fileInputRef.current.value = '';
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', file);
      
      if (customSlug) {
        formData.append('slug', customSlug);
      }
      
      const res = await axios.post('/api/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      setFileInfo({
        slug: res.data.slug,
        filename: res.data.filename,
        size: res.data.size,
        url: `${window.location.origin}/api/file/${res.data.slug}`
      });
      
      setSuccess(true);
      setLoading(false);
      
      // Copy link to clipboard
      const shareLink = `${window.location.origin}/api/file/${res.data.slug}`;
      navigator.clipboard.writeText(shareLink);
      
      // Reset form
      setFile(null);
      setCustomSlug('');
      fileInputRef.current.value = '';
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="file-share-container">
      <h1 className="file-share-title">Share Files</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">File uploaded! Link copied to clipboard.</div>}
      
      <form onSubmit={handleSubmit} className="file-share-form">
        <div className="file-upload-area">
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="file-input"
            ref={fileInputRef}
          />
          <label htmlFor="file" className="file-label">
            {file ? file.name : 'Choose a file'}
          </label>
          {file && (
            <div className="file-info">
              <p>Selected file: {file.name}</p>
              <p>Size: {formatFileSize(file.size)}</p>
            </div>
          )}
        </div>
        
        <div className="form-group custom-url">
          <label htmlFor="fileCustomSlug">Custom URL (optional):</label>
          <div className="custom-url-input">
            <span className="url-prefix">{window.location.origin}/api/file/</span>
            <input
              type="text"
              id="fileCustomSlug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.replace(/\s+/g, '-'))}
              placeholder="my-file"
            />
          </div>
        </div>
        
        {loading && (
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading || !file}
        >
          {loading ? 'Uploading...' : 'Upload & Share'}
        </button>
        
        {fileInfo && (
          <div className="file-share-info">
            <h3>File Shared Successfully!</h3>
            <p>Filename: {fileInfo.filename}</p>
            <p>Size: {formatFileSize(fileInfo.size)}</p>
            <p>Share this link:</p>
            <div className="share-link-container">
              <input 
                type="text" 
                value={fileInfo.url} 
                readOnly 
                className="share-link-input"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(fileInfo.url);
                  setSuccess(true);
                  setTimeout(() => {
                    setSuccess(false);
                  }, 3000);
                }}
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FileShare;