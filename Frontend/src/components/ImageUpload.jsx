import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageUpload = ({ 
  onImageUpload, 
  currentImage = null, 
  className = '', 
  multiple = false,
  maxFiles = 5 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState(currentImage ? (Array.isArray(currentImage) ? currentImage : [currentImage]) : []);
  const fileInputRef = useRef(null);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/images/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.data;
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const filesToUpload = multiple ? 
        Array.from(files).slice(0, maxFiles - images.length) : 
        [files[0]];

      const uploadPromises = filesToUpload.map(file => uploadToCloudinary(file));
      const uploadedImages = await Promise.all(uploadPromises);

      const newImages = multiple ? [...images, ...uploadedImages] : uploadedImages;
      setImages(newImages);
      
      if (onImageUpload) {
        onImageUpload(multiple ? newImages : newImages[0]);
      }

      toast.success(`Image${uploadedImages.length > 1 ? 's' : ''} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    handleDragEvents(e);
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    handleDragEvents(e);
    setDragActive(false);
  };

  const handleDrop = (e) => {
    handleDragEvents(e);
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    handleFileUpload(files);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    if (onImageUpload) {
      onImageUpload(multiple ? newImages : null);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEvents}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB {multiple && `(max ${maxFiles} files)`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className={`grid gap-4 ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.url || image.secure_url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload More Button (for multiple uploads) */}
      {multiple && images.length > 0 && images.length < maxFiles && (
        <button
          onClick={openFileDialog}
          disabled={uploading}
          className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Add More Images ({images.length}/{maxFiles})
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
