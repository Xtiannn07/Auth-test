// src/components/PostComponents/DeleteMenu.tsx
import React, { useRef, useEffect } from 'react';
import {EllipsisVertical } from 'lucide-react';

interface DeleteMenuProps {
  isOpen: boolean;
  toggleOpen: () => void;
  onDelete: () => void;
}

export function DeleteMenu({ isOpen, toggleOpen, onDelete }: DeleteMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        toggleOpen();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleOpen]);
  
  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={toggleOpen}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <EllipsisVertical />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <button
            onClick={onDelete}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
          >
            Delete Post
          </button>
        </div>
      )}
    </div>
  );
}