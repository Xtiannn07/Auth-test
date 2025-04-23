// src/Services/ImageService.tsx

export interface ProfileImage {
  id: string;
  url: string;
  alt: string;
}

export class ImageService {
  // Mock profile images data
  private static mockImages: ProfileImage[] = [
    { id: '1', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Caleb', alt: 'Avatar 1' },
    { id: '2', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver&accessories[]', alt: 'Avatar 2' },
    { id: '3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', alt: 'Avatar 3' },
    { id: '4', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Wyatt&accessories[]', alt: 'Avatar 4' },
    { id: '5', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Eliza', alt: 'Avatar 5' },
    { id: '6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', alt: 'Avatar 6' },
    //
    { id: '7', url: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Leo', alt: 'Avatar 7' },
    { id: '8', url: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Vivian', alt: 'Avatar 8' },
    { id: '9', url: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Brian', alt: 'Avatar 9' },
    { id: '10', url: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Jude', alt: 'Avatar 10' },
    { id: '11', url: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Ryker', alt: 'Avatar 11' },
    { id: '12', url: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=George', alt: 'Avatar 12' },
    //
    { id: '13', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=George', alt: 'Avatar 13' },
    { id: '14', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Andrea', alt: 'Avatar 14' },
    { id: '15', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Jameson', alt: 'Avatar 15' },
    { id: '16', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Jade', alt: 'Avatar 16' },
    { id: '17', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Katherine', alt: 'Avatar 17' },
    { id: '18', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Oliver', alt: 'Avatar 18' },
  ];

  static async getProfileImages(): Promise<ProfileImage[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockImages;
  }
}