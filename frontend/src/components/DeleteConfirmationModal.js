import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import api from '../api'; // Import api helper

// --- Modal Styling ---
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '450px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '24px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
};
Modal.setAppElement('#root');

// --- Component ---
// We now pass in productToDelete instead of all the props
function DeleteConfirmationModal({ isOpen, onRequestClose, productToDelete }) {
  
  // --- NEW: Modal now manages its own state ---
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMessage('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  // --- NEW: Handler for the "Yes, Delete" button ---
  const handleConfirmDelete = async () => {
    if (!productToDelete || isDeleting) return;

    setIsDeleting(true);
    setError('');
    setSuccessMessage('');

    try {
      // Call the API delete route
      await api.delete(`/products/${productToDelete._id}`);
      
      // Set the success message
      setSuccessMessage('Product deleted successfully!');
      
      // Keep modal open, keep isDeleting true until closed
      
    } catch (err) {
      console.error('Delete error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Error deleting product.';
      setError(`Error: ${errMsg}`);
      setIsDeleting(false); // Re-enable buttons on error
    }
  };

  // Don't render if closed
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Confirm Delete Modal"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Are you sure?</h2>

        {/* --- Conditionally show Confirmation, Success, or Error --- */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && <p className="text-green-600 text-center mb-4 font-semibold">{successMessage}</p>}

        {/* Show this if NO success message */}
        {!successMessage && (
          <p className="text-gray-700 mb-6">
            Do you really want to delete the product: <br/>
            <strong className="font-semibold text-red-600">
              {productToDelete ? productToDelete.name : 'this item'}
            </strong>?
            <br/><br/>
            This action cannot be undone.
          </p>
        )}
        
        {/* --- Conditionally show Action Buttons or Close Button --- */}
        {!successMessage ? (
          // Show Delete/Cancel buttons
          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleConfirmDelete} // Run the internal delete function
              className="flex-1 bg-red-600 text-white font-bold py-3 px-6 rounded hover:bg-red-700 disabled:bg-gray-400"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={onRequestClose} // Just close the modal
              className="flex-1 bg-gray-500 text-white font-bold py-3 px-6 rounded hover:bg-gray-600 disabled:bg-gray-400"
              disabled={isDeleting}
            >
              Cancel
            </button>
          </div>
        ) : (
          // Show Close button on success
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onRequestClose} // Close button
              className="w-full bg-gray-500 text-white font-bold p-3 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </Modal>
  );
}

export default DeleteConfirmationModal;