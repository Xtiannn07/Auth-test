// Thread/ThreadsList.jsx
import ThreadItem from './ThreadItem';

export default function ThreadsList() {
  const threads = [
    {
      id: 1,
      content: "Just visited this amazing coffee shop downtown. The atmosphere was perfect for catching up on emails while enjoying some quality espresso. What's your favorite work spot?",
      image: "/api/placeholder/400/320",
      likes: 342,
      replies: 57,
      timestamp: "2d"
    },
    {
      id: 2,
      content: "Trying out a new productivity method this week. So far, time blocking has been a game changer for my workflow!",
      likes: 213,
      replies: 28,
      timestamp: "4d"
    },
    {
      id: 3,
      content: "What's everyone reading this month? Just finished 'Atomic Habits' and can't recommend it enough.",
      image: "/api/placeholder/400/200",
      likes: 529,
      replies: 82,
      timestamp: "1w"
    }
  ];
  
  return (
    <div className="divide-y divide-gray-800">
      {threads.map(thread => (
        <ThreadItem key={thread.id} thread={thread} />
      ))}
    </div>
  );
}