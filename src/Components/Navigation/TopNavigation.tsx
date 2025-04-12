// Top navigation component
import { ArrowLeft, MoreHorizontal} from 'lucide-react';

export default function TopNavigation({ username }) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <ArrowLeft className="h-5 w-5 mr-6" />
          <h2 className="text-xl font-semibold">{username}</h2>
        </div>
        <MoreHorizontal className="h-5 w-5" />
      </div>
    );
  }

