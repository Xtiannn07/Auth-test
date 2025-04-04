// src/utils/mockData.js
export const mockUsers = {
    'user1': {
      uid: 'user1',
      displayName: 'John Doe',
      email: 'john@example.com',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      coverPhoto: 'https://source.unsplash.com/random/800x300/?nature',
      bio: 'Software developer and outdoor enthusiast. Building things for the web and climbing mountains on weekends.',
      location: 'San Francisco, CA',
      workplace: 'TechCorp Inc.',
      friendCount: 342,
      friends: [
        {
          id: 'user2',
          name: 'Jane Smith',
          profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        {
          id: 'user3',
          name: 'Mike Johnson',
          profilePicture: 'https://randomuser.me/api/portraits/men/2.jpg'
        },
        {
          id: 'user4',
          name: 'Sarah Williams',
          profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        {
          id: 'user5',
          name: 'David Brown',
          profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
        },
        {
          id: 'user6',
          name: 'Emily Davis',
          profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg'
        },
        {
          id: 'user7',
          name: 'Robert Wilson',
          profilePicture: 'https://randomuser.me/api/portraits/men/4.jpg'
        }
      ],
      photos: [
        'https://source.unsplash.com/random/300x300/?nature,1',
        'https://source.unsplash.com/random/300x300/?city,1',
        'https://source.unsplash.com/random/300x300/?people,1',
        'https://source.unsplash.com/random/300x300/?animal,1',
        'https://source.unsplash.com/random/300x300/?food,1',
        'https://source.unsplash.com/random/300x300/?travel,1',
        'https://source.unsplash.com/random/300x300/?architecture,1',
        'https://source.unsplash.com/random/300x300/?technology,1',
        'https://source.unsplash.com/random/300x300/?sports,1'
      ],
      posts: [
        {
          id: 'post1',
          content: 'Just finished my latest project! So excited to share it with everyone soon.',
          timestamp: Date.now() - 3600000 * 2, // 2 hours ago
          likes: 24,
          comments: [
            { id: 'comment1', user: 'Jane Smith', text: 'Congrats! Can\'t wait to see it.' },
            { id: 'comment2', user: 'Mike Johnson', text: 'Awesome work!' }
          ]
        },
        {
          id: 'post2',
          content: 'Beautiful day for a hike! The views were incredible.',
          image: 'https://source.unsplash.com/random/800x400/?mountain',
          timestamp: Date.now() - 3600000 * 24, // 24 hours ago
          likes: 56,
          comments: [
            { id: 'comment3', user: 'Sarah Williams', text: 'Where is this?' },
            { id: 'comment4', user: 'David Brown', text: 'Amazing shot!' },
            { id: 'comment5', user: 'Emily Davis', text: 'Let\'s go together next time!' }
          ]
        },
        {
          id: 'post3',
          content: 'Learning new technologies is always challenging but rewarding. Currently diving into React 18 features.',
          timestamp: Date.now() - 3600000 * 48, // 48 hours ago
          likes: 32,
          comments: []
        }
      ],
      saved: [
        {
          id: 'saved1',
          title: 'React Hooks Guide',
          description: 'Comprehensive guide to all React hooks with examples'
        },
        {
          id: 'saved2',
          title: 'Best Hiking Trails',
          description: 'Top 10 hiking trails in Northern California'
        },
        {
          id: 'saved3',
          title: 'JavaScript Design Patterns',
          description: 'Common design patterns in JavaScript applications'
        }
      ]
    },
    'user2': {
      uid: 'user2',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
      coverPhoto: 'https://source.unsplash.com/random/800x300/?city',
      bio: 'UX Designer passionate about creating intuitive user experiences. Coffee lover and bookworm.',
      location: 'New York, NY',
      workplace: 'DesignHub',
      friendCount: 289,
      // ... similar structure for other users
    }
  };
  
  export function getUserData(uid) {
    return mockUsers[uid] || null;
  }