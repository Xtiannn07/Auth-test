import { Loader } from 'lucide-react';

export default function LoaderSpinner({ 
  size = 8, 
  color = "text-black", 
  containerHeight = "h-40" 
}) {
  return (
    <div className={`flex justify-center items-center ${containerHeight}`}>
      <Loader className={`animate-spin rounded-full h-${size} w-${size} ${color}`} />
    </div>
  );
}