// TabContent.jsx
import ThreadsList from '../Thread/ThreadList';
import EmptyState from '../../../Components/UI/EmptyState';

export default function TabContent({ activeTab }) {
  return (
    <div className="flex-1 overflow-y-auto">
      {activeTab === 'threads' && <ThreadsList />}
      {activeTab === 'replies' && <EmptyState message="No replies yet" />}
      {activeTab === 'reposts' && <EmptyState message="No reposts yet" />}
    </div>
  );
}