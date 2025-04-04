// src/components/UI/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContexts';
import { CircleUser } from "lucide-react";

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-purple-400 to-blue-800 bg-clip-text text-transparent shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-sm md:text-xl font-bold">
            <img src="firebase.svg" alt="Logo" className="max-w-1/12" />
            Authentication with firebase
        </Link>
        
        <div className="flex space-x-4">
          {currentUser ? (
            <>
              <Link to="/profile" className=" hover:text-blue-600">Profile</Link>
              <button 
                onClick={logout} 
                className=" hover:text-blue-600">
                Sign Out
              </button>
            </>
          ) : (
            <div className='mr-10'>
                <Link to="/" className="flex items-center space-x-2">
                <CircleUser size={48} className="text-blue-400" />
                </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}