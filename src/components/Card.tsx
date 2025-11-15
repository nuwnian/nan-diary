import { useState, useRef } from 'react';

type CardProps = {
  title: string;
  date: string;
  image?: string;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onImageChange?: (imageData: string) => void;
};

export default function Card({ title, date, image, onClick, onDelete, onImageChange }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image too large! Please choose an image smaller than 5MB.');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      
      // Compress image if it's too large
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set max dimensions
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedData = canvas.toDataURL('image/jpeg', 0.8);
        
        if (onImageChange) {
          onImageChange(compressedData);
        }
        
        // Close edit mode after successful upload
        setIsEditing(false);
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
  };

  const handleChangeImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleCardClick = () => {
    // Only open detail view if not in edit mode
    if (!isEditing) {
      onClick();
    }
  };

  return (
    <div className="neuro-card rounded-3xl p-6 cursor-pointer relative group" onClick={handleCardClick}>
      {/* Edit button - shows on hover when not editing */}
      {!isEditing && (
        <button
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 neuro-button rounded-full w-8 h-8 flex items-center justify-center hover:scale-110 z-20"
          onClick={handleEditClick}
          aria-label="Edit card"
          title="Edit card"
        >
          <i className="bx bx-image-add text-base"></i>
        </button>
      )}

      {/* Edit mode overlay */}
      {isEditing && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl z-30 flex flex-col items-center justify-center gap-4">
          <button
            className="neuro-button px-6 py-3 rounded-full flex items-center gap-2 text-sm font-medium hover:scale-105 transition-transform"
            onClick={handleChangeImageClick}
            aria-label="Change image"
          >
            <i className="bx bx-image-add text-lg"></i>
            Change Image
          </button>
          
          <button
            className="neuro-button px-6 py-3 rounded-full flex items-center gap-2 text-sm font-medium hover:scale-105 transition-transform"
            onClick={handleEditClick}
            aria-label="Close edit mode"
          >
            <i className="bx bx-x text-lg"></i>
            Done
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
        aria-hidden="true"
      />

      {/* Image area */}
      <div className="neuro-inset rounded-2xl h-48 mb-4 flex items-center justify-center overflow-hidden relative">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-16 h-16 bg-[#8EB69B] dark:bg-[#6b8e7a] rounded-full opacity-60"></div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-[#333] dark:text-[#e0e0e0] font-semibold text-lg truncate">
          {title}
        </h3>
        <p className="text-[#666] dark:text-[#999] text-sm">
          {date}
        </p>
      </div>

      {/* Delete button - only show when not editing */}
      {!isEditing && (
        <button
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 neuro-button rounded-full w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-600 hover:scale-110"
          onClick={onDelete}
          aria-label="Delete project"
          title="Delete project"
        >
          <i className="bx bx-trash text-sm"></i>
        </button>
      )}
    </div>
  );
}