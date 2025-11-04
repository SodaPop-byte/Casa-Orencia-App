import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import api from '../api';

// --- Modal Styling (no changes) ---
// --- Modal Styling (Similar to Edit Modal) ---
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '350px', // <-- CHANGE THIS VALUE (e.g., from 400px to 350px)
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

function PlaceOrderModal({ isOpen, onRequestClose, productToOrder, onOrderPlaced }) {
  // --- State Variables ---
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // 1. New state for success message

  // --- Reset state useEffect (no changes) ---
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError('');
      setSuccessMessage(''); // Reset success message too
      setIsSubmitting(false);
    }
  }, [isOpen, productToOrder]);

  // --- Handle quantity change (no changes) ---
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    // ... (rest of the function is the same)
    if (e.target.value === '' || (value >= 1 && value <= productToOrder?.stock)) {
      setQuantity(e.target.value === '' ? '' : value);
    } else if (value < 1) {
      setQuantity(1);
    } else if (productToOrder && value > productToOrder.stock) {
      setQuantity(productToOrder.stock);
    }
  };

  // --- Handle submit (UPDATED) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productToOrder || isSubmitting || quantity === '' || quantity < 1) {
        setError('Please enter a valid quantity.');
        return;
    };
    setIsSubmitting(true);
    setError('');
    setSuccessMessage(''); // Clear previous success

    try {
      await api.post('/orders', {
        productId: productToOrder._id,
        quantity: parseInt(quantity)
      });

      // 2. Set success message instead of alert
      setSuccessMessage('Order placed successfully!');
      if(onOrderPlaced) onOrderPlaced();

      // 3. Close modal after a short delay
      setTimeout(() => {
        onRequestClose();
      }, 1500); // Close after 1.5 seconds

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to place order.';
      console.error('Order error:', err);
      setError(`Error: ${errorMessage}`);
      setIsSubmitting(false); // Make sure button is enabled on error
    }
    // Don't set isSubmitting to false here if successful,
    // keep button disabled until modal closes.
  };

  // --- Don't render check (no changes) ---
  if (!isOpen || !productToOrder) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Place Order Modal"
    >
      <h2 className="text-2xl font-bold text-center mb-4">Place Order</h2>
      <div className="text-center mb-4">
        <p className="font-semibold">{productToOrder.name}</p>
        <p className="text-sm text-gray-600">Available Stock: {productToOrder.stock}</p>
      </div>

      {/* --- Show Success OR Error --- */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 text-center mb-4 font-semibold">{successMessage}</p>}

      {/* Only show form if no success message */}
      {!successMessage && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="quantity" className="block text-gray-700 font-medium mb-2">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full p-2 border border-gray-300 rounded"
              min="1"
              max={productToOrder.stock}
              required
              disabled={isSubmitting}
            />
            {quantity !== '' && quantity > productToOrder.stock && (
              <p className="text-red-500 text-xs mt-1">Quantity cannot exceed stock ({productToOrder.stock}).</p>
            )}
            {quantity !== '' && quantity < 1 && (
                <p className="text-red-500 text-xs mt-1">Quantity must be at least 1.</p>
            )}
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white font-bold p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isSubmitting || quantity === '' || quantity < 1 || quantity > productToOrder.stock}
            >
              {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
            </button>
            <button
              type="button"
              onClick={onRequestClose}
              className="flex-1 bg-gray-500 text-white font-bold p-3 rounded hover:bg-gray-600 disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default PlaceOrderModal;