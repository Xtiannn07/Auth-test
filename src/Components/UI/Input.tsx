// src/components/UI/Input.jsx

export default function Input({ type, placeholder, required, onChange, value, name, className }) {
  return (
    <input
      type={type || 'text'}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
      value={value}
      name={name}
      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
}