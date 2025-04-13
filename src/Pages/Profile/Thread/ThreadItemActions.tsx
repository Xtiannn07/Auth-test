// Thread/ThreadItemActions.jsx
import { Heart } from 'lucide-react';

export default function ThreadItemActions() {
  return (
    <div className="flex items-center mt-3 text-gray-500">
      <Heart className="h-5 w-5 mr-4" />
      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10904 20.6391 10.5124 21 12 21Z" />
      </svg>
      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 10L12 15L17 10" />
      </svg>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 15L5 17C5 18.1046 5.89543 19 7 19L17 19C18.1046 19 19 18.1046 19 17L19 15M12 4L12 16M12 4L8 8M12 4L16 8" />
      </svg>
    </div>
  );
}