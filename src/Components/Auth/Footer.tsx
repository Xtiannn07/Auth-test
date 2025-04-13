import { Link } from 'react-router-dom';

export default function SignInFooter() {
  return (
    <div className="w-full mt-auto flex flex-col items-center">
      <div className="w-full max-w-md flex p-[1px] rounded-3xl bg-gradient-to-r from-purple-400 to-blue-300">
        <Link 
            to="/signup" 
            className="group w-full text-center bg-white bg-opacity-0 text-blue-600 font-semibold py-2 px-4 rounded-3xl"
            >
            <span className="inline-block group-hover:scale-105 transition-transform duration-150">
              Create new account
          </span>
        </Link>
      </div>
      
      {/* Meta logo at bottom */}
      <div className="mt-4 mb-2 flex items-center space-x-1">
        <img 
          src="/meta-icon.svg"
          alt="Meta" 
          className="h-4 filter grayscale contrast-50 rotate-180"
        />
        <span className="text-gray-600 text-sm font-medium">Metange</span>
      </div>
      
      {/* Footer links */}
      <div className="flex space-x-4 text-[10px] text-gray-500">
        <a href="#" className="hover:underline">About</a>
        <a href="#" className="hover:underline">Help</a>
        <a href="#" className="hover:underline">More</a>
      </div>
      <div className="flex space-x-4 text-[10px] text-gray-500">
        <p>guest@gmail.com / 123456</p>
      </div>
      
    </div>
  );
}