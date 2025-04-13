// Thread/ThreadItemHeader.jsx
import { MoreHorizontal } from 'lucide-react';

export default function ThreadItemHeader({ username, timestamp }) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-medium">{username}</div>
      <div className="flex items-center text-gray-500">
        <span className="text-xs">{timestamp}</span>
        <MoreHorizontal className="h-4 w-4 ml-2" />
      </div>
    </div>
  );
}