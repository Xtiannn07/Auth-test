// Thread/ThreadItem.jsx
import ThreadItemSidebar from './ThreadItemSidebar';
import ThreadItemHeader from './ThreadItemHeader';
import ThreadItemContent from './ThreadItemContent';
import ThreadItemActions from './ThreadItemActions';
import ThreadItemStats from './ThreadItemStats';

export default function ThreadItem({ thread }) {
  return (
    <div className="p-4">
      <div className="flex">
        <ThreadItemSidebar />
        <div className="flex-1">
          <ThreadItemHeader username="jessicalexus" timestamp={thread.timestamp} />
          <ThreadItemContent content={thread.content} image={thread.image} />
          <ThreadItemActions />
          <ThreadItemStats likes={thread.likes} replies={thread.replies} />
        </div>
      </div>
    </div>
  );
}