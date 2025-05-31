import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UploadImage = () => {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');

  // Lấy danh sách ảnh khi component mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/images');
      setImages(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy ảnh:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Vui lòng chọn file!');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data.message);
      setFile(null);
      fetchImages(); // Cập nhật danh sách ảnh
    } catch (error) {
      setMessage(error.response?.data?.error || 'Lỗi khi upload!');
    }
  };

  return (
    <div>
      <h2>Upload Ảnh</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}

      <h3>Danh sách ảnh</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {images.map((image) => (
          <div key={image.id} style={{ margin: '10px' }}>
            <img
              src={`http://localhost:5000${image.path}`}
              alt={image.image_name}
              style={{ maxWidth: '200px' }}
            />
            <p>{image.img_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadImage;