// src/components/UI/Notification.tsx
import { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function Notification({ 
  type, 
  message, 
  duration = 5000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade-out animation to complete
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="mr-2" />;
      case 'error':
        return <AlertCircle size={18} className="mr-2" />;
      case 'info':
        return <Info size={18} className="mr-2" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
    >
      <div className={`${getBgColor()} text-white px-4 py-3 rounded-md shadow-lg flex items-center`}>
        {getIcon()}
        <span className="mr-4">{message}</span>
        <button 
          onClick={() => setIsVisible(false)} 
          className="text-white hover:text-white/80"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}