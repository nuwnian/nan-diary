type CardProps = {
  title: string;
  date: string;
  image?: string;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onImageChange?: (imageData: string) => void;
};

export default function Card({ title, date, image, onClick, onDelete, onImageChange }: CardProps) {
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
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="neuro-card rounded-3xl p-6 cursor-pointer relative group" onClick={onClick}>
      {/* Delete button - appears on hover */}
      <button
        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 neuro-button rounded-full w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-600"
        onClick={onDelete}
        aria-label="Delete project"
      >
        <i className="bx bx-trash text-sm"></i>
      </button>

      {/* Image area */}
      <div 
        className="neuro-inset rounded-2xl h-48 mb-4 flex items-center justify-center overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-16 h-16 bg-[#8EB69B] dark:bg-[#6b8e7a] rounded-full opacity-60"></div>
        )}
        
        {/* Change Image Button - appears on hover */}
        <button
          className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white font-medium"
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById(`file-input-${title}`)?.click();
          }}
        >
          Change Image
        </button>
        
        {/* Hidden file input */}
        <input
          id={`file-input-${title}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
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
    </div>
  );
}