import React, { useState, useEffect } from 'react';
import api from '../api';
import socket from '../socket';
import EditProductModal from '../components/EditProductModal';
import AddProductModal from '../components/AddProductModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ProductCard from '../components/ProductCard';
import useDebounce from '../hooks/useDebounce'; // 1. Import the debounce hook

function AdminPage() {
  // State Variables
  const [products, setProducts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // --- NEW: Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce search input
  // --- END NEW ---


  // --- UPDATED: Fetch initial products useEffect ---
  // This now re-runs when the debounced search term changes
  useEffect(() => {
    // Build the query parameters
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) {
      params.append('search', debouncedSearchTerm); // Add search query if present
    }

    const url = `/products?${params.toString()}`;

    api.get(url)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err));
  }, [debouncedSearchTerm]); // 2. Re-run when search term changes

  // --- Socket listeners useEffect (no major changes) ---
   useEffect(() => {
    function onNewProduct(newProduct) {
      // Only add new product if it matches the current search term
      const searchMatch = !debouncedSearchTerm || newProduct.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      if (searchMatch) {
         setProducts(prev => [newProduct, ...prev]);
      }
    }
    function onProductUpdate(updatedProduct) {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    }
    function onProductDelete(data) {
       setProducts(prev => prev.filter(p => p._id !== data.id));
       if (productToEdit && productToEdit._id === data.id && isEditModalOpen) {
           closeEditModal();
       }
       if (productToDelete && productToDelete._id === data.id && isDeleteModalOpen) {
           closeDeleteModal();
       }
    }
    socket.on('newProduct', onNewProduct);
    socket.on('stockUpdated', onProductUpdate);
    socket.on('productUpdated', onProductUpdate);
    socket.on('productDeleted', onProductDelete);
    return () => {
      socket.off('newProduct', onNewProduct);
      socket.off('stockUpdated', onProductUpdate);
      socket.off('productUpdated', onProductUpdate);
      socket.off('productDeleted', onProductDelete);
    };
  }, [productToEdit, isEditModalOpen, productToDelete, isDeleteModalOpen, debouncedSearchTerm]); // 3. Added debouncedSearchTerm

  // --- Modal Handlers (no changes) ---
  const openEditModal = (product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setProductToEdit(null);
  };
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };
  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };
  
   const handleProductUpdatedInModal = () => { /* Socket handles update */ };
   const handleProductAddedInModal = () => { /* Socket handles update */ };

  return (
    <div className="p-8 bg-theme-light min-h-screen">
      {/* --- Add Product Button --- */}
      <div className="max-w-6xl mx-auto mb-8 text-right">
          <button
            onClick={openAddModal}
            className="bg-theme-accent text-white font-bold py-2 px-4 rounded hover:bg-theme-accent-hover"
            disabled={isEditModalOpen || isAddModalOpen || isDeleteModalOpen}
          >
            + Add New Product
          </button>
      </div>

      {/* --- Manage Products Section --- */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold font-serif text-theme-dark text-center mb-8">Product Management</h2>
        
        {/* 4. NEW: Search Bar Component */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search products by name..."
              className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>
        {/* --- END NEW --- */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onImageClick={() => {}}
              isAdminView={true}
              isModalOpen={isEditModalOpen || isAddModalOpen || isDeleteModalOpen}
            />
          ))}
        </div>
      </div>

      {/* --- Render Modals (no changes) --- */}
      <EditProductModal
          isOpen={isEditModalOpen}
          onRequestClose={closeEditModal}
          productToEdit={productToEdit}
          onProductUpdated={handleProductUpdatedInModal}
      />
      <AddProductModal
          isOpen={isAddModalOpen}
          onRequestClose={closeAddModal}
          onProductAdded={handleProductAddedInModal}
      />
      <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onRequestClose={closeDeleteModal}
          productToDelete={productToDelete}
      />
    </div>
  );
}

export default AdminPage;