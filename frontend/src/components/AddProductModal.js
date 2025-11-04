import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import api from '../api';

// --- Define categories ---
const categories = ['Barong', 'Saya', 'Fabric'];

// --- Modal Styling (Narrower) ---
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '450px', // Narrower width
    maxHeight: '80vh',
    overflow: 'auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
};
Modal.setAppElement('#root');

function AddProductModal({ isOpen, onRequestClose, onProductAdded }) {
  // State for the form fields
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0],
    price: 0,
    stock: 0
  });
  
  // --- UPDATED: file state is now files (an array/list) ---
  const [files, setFiles] = useState(null); 
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form when modal opens
  const handleAfterOpen = () => {
    setFormData({ name: '', category: categories[0], price: 0, stock: 0 });
    setFiles(null); // Reset files
    setError('');
    setSuccessMessage('');
    setIsUploading(false);
    const fileInput = document.getElementById('productImageInputAdd');
    if (fileInput) fileInput.value = null;
  };

  // Handle text/select input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- UPDATED: Handle file input changes ---
  const handleFileChange = (e) => {
    setFiles(e.target.files); // Save the entire FileList
  };

  // --- UPDATED: Handle form submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if files were selected and within the limit
    if (!files || files.length === 0) {
      setError('Please select at least one image file.');
      return;
    }
    if (files.length > 5) { // 5 is the limit we set in the backend
      setError('You can only upload a maximum of 5 images.');
      return;
    }
    
    if (isUploading) return;

    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    const data = new FormData();
    // Add text data
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // --- UPDATED: Append all files ---
    // Loop through the FileList and append each one
    // The key 'images' MUST match your backend route
    for (let i = 0; i < files.length; i++) {
      data.append('images', files[i]);
    }

    try {
      const response = await api.post('/products', data);
      setSuccessMessage('Product uploaded successfully!');
      if (onProductAdded) onProductAdded(response.data);
      setTimeout(() => { onRequestClose(); }, 1500);

    } catch (err) {
      console.error('Upload error caught!', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error uploading product.';
      setError(`Error: ${errorMessage}`);
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={handleAfterOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Add New Product Modal"
    >
      <h2 className="text-2xl font-bold text-center mb-6">Add New Product</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 text-center mb-4 font-semibold">{successMessage}</p>}

      {!successMessage ? (
        <form onSubmit={handleSubmit}>
          {/* ... (Text inputs) ... */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required disabled={isUploading} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
              required
              disabled={isUploading}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Price (₱)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required disabled={isUploading} min="0"/>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Stock</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required disabled={isUploading} min="0"/>
          </div>
          
          {/* --- UPDATED: File Input --- */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Product Images (Up to 5)</label>
            <input
              id="productImageInputAdd"
              type="file"
              name="images" // Name matches backend
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
              accept="image/png, image/jpeg, image/jpg"
              required
              disabled={isUploading}
              multiple // Allow multiple file selection
            />
          </div>
          {/* Show how many files are selected */}
          {files && files.length > 0 && (
            <p className="text-sm text-gray-600 mb-4">{files.length} file(s) selected.</p>
          )}

          <div className="flex space-x-4 mt-6">
            <button type="submit" className="flex-1 bg-blue-600 text-white font-bold p-3 rounded hover:bg-blue-700 disabled:bg-gray-400" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Product'}
            </button>
            <button type="button" onClick={onRequestClose} className="flex-1 bg-gray-500 text-white font-bold p-3 rounded hover:bg-gray-600 disabled:bg-gray-400" disabled={isUploading}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
         <div className="mt-6 text-center">
            <button type="button" onClick={onRequestClose} className="w-full bg-gray-500 text-white font-bold p-3 rounded hover:bg-gray-600">
              Close
            </button>
         </div>
      )}
    </Modal>
  );
}

export default AddProductModal;