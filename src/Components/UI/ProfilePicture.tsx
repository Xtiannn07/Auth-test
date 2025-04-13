// UI/ProfilePicture.jsx
export default function ProfilePicture({ src, size = "md", alt = "Profile" }) {
    const sizeClasses = {
      sm: "h-10 w-10",
      md: "h-12 w-12",
      lg: "h-16 w-16"
    };
    
    return (
      <div className={`${sizeClasses[size]} bg-gray-700 rounded-full overflow-hidden`}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }