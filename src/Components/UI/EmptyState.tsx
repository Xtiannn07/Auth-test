// UI/EmptyState.jsx
export default function EmptyState({ message }) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        {message}
      </div>
    );
  }