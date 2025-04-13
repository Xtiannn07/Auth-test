// src/Components/UI/SuccessToast.tsx
import { useEffect } from 'react';

export default function SuccessToast({ 
  message, 
  onDismiss 
}: { 
  message: string; 
  onDismiss: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
        <span>{message}</span>
        <button 
          onClick={onDismiss} 
          className="ml-2 text-white hover:text-green-200"
        >
          &times;
        </button>
      </div>
    </div>
  );
}