// Thread/ThreadItemStats.jsx
export default function ThreadItemStats({ likes, replies }) {
    return (
      <div className="mt-1 text-sm text-gray-500">
        <span>{likes} likes</span>
        <span className="mx-1">•</span>
        <span>{replies} replies</span>
      </div>
    );
  }