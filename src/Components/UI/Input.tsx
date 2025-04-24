// In your Input component file (../UI/Input.tsx)
import { ChangeEvent } from 'react';

interface InputProps {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className: string;
  disabled?: boolean;
  onBlur?: () => void;
}

export default function Input({
  id,
  name,
  type,
  required,
  placeholder,
  value,
  onChange,
  className,
  disabled,
  onBlur
}: InputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={className}
    />
  );
}