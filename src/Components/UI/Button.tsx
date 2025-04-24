// src/Components/UI/Button.tsx
import { ReactNode, MouseEvent } from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export default function Button({ type, onClick, children, disabled, className }: ButtonProps) {
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      className={`group px-4 py-2 font-medium text-white bg-gradient-to-r from-purple-400 to-blue-300 rounded-3xl transition duration-150 disabled:opacity-80 ${className}`}
    >
      <span className="inline-block group-hover:scale-110 transition-transform duration-150">
        {children}
      </span>
    </button>
  );
}