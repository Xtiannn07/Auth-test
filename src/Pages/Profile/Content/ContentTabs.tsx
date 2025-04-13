
// ContentTabs.jsx
export default function ContentTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'threads', label: 'Threads' },
    { id: 'replies', label: 'Replies' },
    { id: 'reposts', label: 'Reposts' }
  ];
  
  return (
    <div className="flex border-t border-b border-gray-800 mt-4">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          className={`flex-1 py-3 font-medium ${activeTab === tab.id ? 'border-b-2 border-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}