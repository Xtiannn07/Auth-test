
// Main layout component
export default function ProfilePage({ userData, currentUser }) {
  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <Profile/>
      <BottomNavigation />
    </div>
  );
}