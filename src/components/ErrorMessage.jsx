// src/components/ErrorMessage.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="alert alert-error">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}
