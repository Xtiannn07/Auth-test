// Thread/ThreadItemContent.jsx
export default function ThreadItemContent({ content, image }) {
    return (
      <>
        <p className="mt-1 text-sm">{content}</p>
        
        {image && (
          <div className="mt-3 bg-gray-800 rounded-xl overflow-hidden">
            <img src={image} alt="Thread image" className="w-full object-cover" />
          </div>
        )}
      </>
    );
  }