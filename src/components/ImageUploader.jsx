// components/ImageUploader.jsx
import React from 'react';

/**
 * ImageUploader component allows the user to upload a local image file.
 * When an image is selected, it triggers the onImageLoad callback and shows the image in Annotator.
 */
function ImageUploader({ onImageLoad }) {
  /**
   * Reads the selected file and converts it to a local URL for previewing.
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onImageLoad(url);
    } else {
      alert('Please select a valid image file.');
    }
  };

  return (
    <div className="image-annotator__uploader">
      <label htmlFor="image-upload" className="image-annotator__uploader-label">
        Upload Image
      </label>
      <input
        id="image-upload"
        className="image-annotator__uploader-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default ImageUploader;
