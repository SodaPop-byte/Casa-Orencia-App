import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import api from '../api';

// --- Define categories (must match) ---
const categories = ['Barong', 'Saya', 'Fabric']; // Add more if you need them

// --- Modal Styling (FIXED WIDTH) ---
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

function EditProductModal({ isOpen, onRequestClose, productToEdit, onProductUpdated }) {
  // --- State Variables ---
  const [editFormData, setEditFormData] = useState({ name: '', category: '', price: 0, stock: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- Pre-fill form useEffect ---
  useEffect(() => {
    if (productToEdit) {
      setEditFormData({
        name: productToEdit.name,
        category: productToEdit.category,
        price: productToEdit.price,
        stock: productToEdit.stock,
      });
    }
    setError('');
    setSuccessMessage('');
    setIsSaving(false);
  }, [productToEdit]); 

  // --- Handle form changes ---
  const handleChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // --- Handle save (no changes) ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!productToEdit || isSaving) return;
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await api.put(`/products/${productToEdit._id}`, editFormData);
      setSuccessMessage('Product updated successfully!');
      if (onProductUpdated) {
         onProductUpdated(response.data);
      }
      setIsSaving(false); 
    } catch (err) {
      console.error('Update error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Error updating product.';
      setError(`Error: ${errMsg}`);
      setIsSaving(false);
    }
  };

  // --- Don't render check ---
  if (!isOpen || !productToEdit) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Edit Product Modal"
    >
      <h2 className="text-2xl font-bold text-center mb-6">Editing: {productToEdit.name}</h2>
      
      {successMessage ? (
        <>
          <p className="text-green-600 text-center mb-4 font-semibold">{successMessage}</p>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onRequestClose}
              className="w-full bg-gray-500 text-white font-bold p-3 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSave}>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Product Name</label>
            <input type="text" name="name" value={editFormData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required disabled={isSaving} />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Category</label>
            <select
              name="category"
              value={editFormData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
              required
              disabled={isSaving}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* --- THIS IS THE FIXED LINE --- */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Price (₱)</label>
            <input type="number" name="price" value={editFormData.price} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required disabled={isSaving} min="0" />
          </div>
          {/* --- END FIX --- */}

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Stock</label>
            <input type="number" name="stock" value={editFormData.stock} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required disabled={isSaving} min="0" />
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white font-bold p-3 rounded hover:bg-green-700 disabled:bg-gray-400"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onRequestClose}
              className="flex-1 bg-gray-500 text-white font-bold p-3 rounded hover:bg-gray-600 disabled:bg-gray-400"
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default EditProductModal;