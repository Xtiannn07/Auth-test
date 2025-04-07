// src/components/Profile/ProfileSaved.jsx
import { Bookmark } from 'lucide-react';

export default function ProfileSaved({ userData }) {
  return (
    <div className="bg-white p-6 rounded-md shadow">
      <h3 className="text-xl font-semibold mb-4">Saved Items</h3>
      {userData?.saved && userData.saved.length > 0 ? (
        <div className="space-y-4">
          {userData.saved.map((item) => (
            <div key={item.id} className="border-b pb-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{item.title}</h4>
                <Bookmark size={16} className="text-blue-500" />
              </div>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No saved items to show</p>
      )}
    </div>
  );
}