// src/components/UI/Button.jsx

export default function Button({ type, onClick, children, disabled, className }) {
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 font-medium text-white bg-blue-600 rounded-3xl transform hover:scale-95 transition duration-150 disabled:opacity-80 ${className}`}
    >
      {children}
    </button>
  );
}