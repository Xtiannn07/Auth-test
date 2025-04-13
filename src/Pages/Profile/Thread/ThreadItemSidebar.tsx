// Thread/ThreadItemSidebar.jsx
import ProfilePicture from '../../../Components/UI/ProfilePicture';

export default function ThreadItemSidebar() {
  return (
    <div className="mr-3">
      <ProfilePicture src="/api/placeholder/40/40" size="sm" />
      <div className="w-0.5 bg-gray-700 h-16 mx-auto mt-1"></div>
    </div>
  );
}