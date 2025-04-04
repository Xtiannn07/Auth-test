import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <div className="w-full mt-auto flex flex-col items-center">
      <div className="w-full max-w-md flex">
        <Link 
          to="/signup" 
          className="w-full text-center border border-blue-600 hover:border-blue-700 active:border-blue-800 text-blue-600 hover:text-blue-700 active:text-blue-800 font-semibold mt-4 py-2 px-4 rounded-3xl bg-transparent">
          Create new account
        </Link>
      </div>
      
      {/* Meta logo at bottom */}
      <div className="mt-4 mb-2 flex items-center space-x-1">
        <img 
          src="/meta-icon.svg"
          alt="Meta" 
          className="h-4 filter grayscale contrast-50"
        />
        <span className="text-gray-600 text-sm font-medium">Meta</span>
      </div>
      
      {/* Footer links */}
      <div className="flex space-x-4 text-[10px] text-gray-500">
        <a href="#" className="hover:underline">About</a>
        <a href="#" className="hover:underline">Help</a>
        <a href="#" className="hover:underline">More</a>
      </div>
    </div>
  );
}