// src/components/Loading.jsx
import React from 'react';

export default function Loading({ message = 'Loading data...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}
