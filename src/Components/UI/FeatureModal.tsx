import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const FeatureModal: React.FC<FeatureModalProps> = ({
  isOpen,
  onClose,
  title = "Coming Soon",
  message = "This feature is still under development and will be available in a future update. Thanks for your patience!"
}) => {
  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Stop propagation on modal click to prevent closing when clicking inside
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 backdrop-blur-xs backdrop-saturate-150 flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: "tween", 
              duration: 0.2,
              ease: "easeOut"
            }}
            onClick={handleModalClick}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-md md:text-lg font-medium text-gray-900">{title}</h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-3 py-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                  <svg
                    className="h-6 w-6 text-gray-900"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">{message}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-gray-50 text-right">
              <motion.button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none"
                onClick={onClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1 }}
              >
                Got it
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeatureModal;