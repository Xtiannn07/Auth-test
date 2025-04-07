// src/components/UI/Notification.jsx
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function Notification({ type, message, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade-out animation to complete
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null; // Prevents rendering when invisible

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-gray-500'
    }`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={() => setIsVisible(false)} className="ml-2">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
