import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { ImageService, ProfileImage } from '../../Services/ImageService';

interface ImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  currentImageUrl?: string;
}

export default function ImageSelector({ isOpen, onClose, onSelect, currentImageUrl }: ImageSelectorProps) {
  const [images, setImages] = useState<ProfileImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>(currentImageUrl);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const profileImages = await ImageService.getProfileImages();
        setImages(profileImages);
      } catch (error) {
        console.error('Error fetching profile images:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setPreviewOpen(true);
  };

  const handleConfirmSelection = () => {
    if (selectedImageUrl) {
      onSelect(selectedImageUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Choose Profile Picture</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleImageSelect(image.url)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all
                    ${selectedImageUrl === image.url 
                      ? 'border-blue-500 ring-2 ring-blue-300' 
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewOpen && selectedImageUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-sm w-full">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">Preview Profile Picture</h3>
              </div>
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                <img
                  src={selectedImageUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmSelection}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t p-4">
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedImageUrl}
            className={`w-full py-2 rounded-full font-medium 
              ${selectedImageUrl
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}