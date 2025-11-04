import React, { useState, useEffect } from 'react';

function ProductCard({ product, onOrderClick, onImageClick, isAdminView, onEdit, onDelete, isModalOpen }) {
  
  const placeholder = 'https://via.placeholder.com/300x200?text=No+Image';
  const images = (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls : [placeholder];
  const [activeImage, setActiveImage] = useState(images[0]);

  // When the product prop changes, reset the active image
  useEffect(() => {
    setActiveImage((product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : placeholder);
  }, [product, product.imageUrls]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-lg">
      
      {/* --- Image Section --- */}
      <div>
        <div 
          className="relative w-full h-48 overflow-hidden cursor-pointer"
          onClick={() => onImageClick(product)}
        >
          <img
            src={activeImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.stock === 0 && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Thumbnail Strip (using new theme colors) */}
        {images.length > 1 && (
          <div className="flex p-2 space-x-2 overflow-x-auto bg-gray-50">
            {images.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${product.name} thumbnail ${index + 1}`}
                onMouseEnter={() => setActiveImage(url)}
                className={`w-12 h-12 object-cover rounded-md cursor-pointer border-2 transition-all ${
                  activeImage === url ? 'border-theme-accent' : 'border-transparent' // Use theme-accent
                } hover:border-theme-accent-hover`}
              />
            ))}
          </div>
        )}

        {/* --- Product Details Section (using new theme colors) --- */}
        <div className="p-4">
          <p className="text-gray-500 text-xs font-medium mb-1">{product.category}</p>
          <h2 className="text-lg font-semibold text-gray-900 truncate font-serif" title={product.name}>
            {product.name}
          </h2>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xl font-bold text-theme-dark">₱{product.price}</p> 
            <p className="text-sm font-medium text-gray-700">
              Stock: <span className="font-bold text-theme-dark">{product.stock}</span>
            </p>
          </div>
        </div>
      </div>

      {/* --- Button Section (using new theme colors) --- */}
      <div className="p-4 pt-0">
        {isAdminView ? (
          // Admin buttons
          <div className="flex space-x-2">
            <button 
              onClick={() => onEdit(product)} 
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-2 px-3 rounded-md transition-all disabled:bg-gray-400" 
              disabled={isModalOpen}
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(product)} 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-3 rounded-md transition-all disabled:bg-gray-400" 
              disabled={isModalOpen}
            >
              Delete
            </button>
          </div>
        ) : (
          // Reseller/Guest button
          onOrderClick && (
            <button
              onClick={() => onOrderClick(product)}
              className={`w-full font-bold p-2 rounded-md transition-all ${
                product.stock === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-theme-accent text-white hover:bg-theme-accent-hover disabled:bg-gray-400' // Use theme-accent
              }`}
              disabled={product.stock === 0 || isModalOpen}
            >
              {product.stock === 0 ? "Out of Stock" : "Place Order"}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default ProductCard;