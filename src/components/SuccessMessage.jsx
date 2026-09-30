// src/components/SuccessMessage.jsx
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessMessage({ message }) {
  if (!message) return null;
  return (
    <div className="alert alert-success">
      <CheckCircle2 size={18} />
      <span>{message}</span>
    </div>
  );
}
